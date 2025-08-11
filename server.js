const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'public', 'data');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 读取JSON文件
async function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error);
    return [];
  }
}

// 写入JSON文件
async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`文件 ${filename} 保存成功`);
    return true;
  } catch (error) {
    console.error(`保存文件 ${filename} 失败:`, error);
    return false;
  }
}

// 获取所有会议
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await readJsonFile('meeting.json');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: '获取会议数据失败' });
  }
});

// 根据ID获取会议
app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meetings = await readJsonFile('meeting.json');
    const meeting = meetings.find(m => m.id === req.params.id);
    if (meeting) {
      res.json(meeting);
    } else {
      res.status(404).json({ error: '会议未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: '获取会议数据失败' });
  }
});

// 创建或更新会议
app.post('/api/meetings', async (req, res) => {
  try {
    await ensureDataDir();
    const meetings = await readJsonFile('meeting.json');
    const meetingData = req.body;
    
    // 修复日期处理：确保保存的日期格式一致
    if (meetingData.date) {
      // 如果日期是 Date 对象，转换为标准字符串格式
      if (meetingData.date instanceof Date) {
        // 转换为本地时间字符串，格式：YYYY-MM-DD HH:mm
        const year = meetingData.date.getFullYear();
        const month = String(meetingData.date.getMonth() + 1).padStart(2, '0');
        const day = String(meetingData.date.getDate()).padStart(2, '0');
        const hours = String(meetingData.date.getHours()).padStart(2, '0');
        const minutes = String(meetingData.date.getMinutes()).padStart(2, '0');
        meetingData.date = `${year}-${month}-${day} ${hours}:${minutes}`;
      } else if (typeof meetingData.date === 'string') {
        // 如果是字符串，验证格式并标准化
        const dateObj = new Date(meetingData.date);
        if (!isNaN(dateObj.getTime())) {
          // 转换为标准格式
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          meetingData.date = `${year}-${month}-${day} ${hours}:${minutes}`;
        }
      }
    }
    
    // 检查是否已存在
    const existingIndex = meetings.findIndex(m => m.id === meetingData.id);
    
    if (existingIndex >= 0) {
      // 更新现有会议
      meetings[existingIndex] = meetingData;
    } else {
      // 创建新会议
      meetings.push(meetingData);
    }
    
    // 保存到文件
    const success = await writeJsonFile('meeting.json', meetings);
    
    if (success) {
      res.json({ message: '会议保存成功', meeting: meetingData });
    } else {
      res.status(500).json({ error: '保存会议失败' });
    }
  } catch (error) {
    console.error('保存会议失败:', error);
    res.status(500).json({ error: '保存会议失败' });
  }
});

// 删除会议
app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const meetings = await readJsonFile('meeting.json');
    const filteredMeetings = meetings.filter(m => m.id !== req.params.id);
    
    const success = await writeJsonFile('meeting.json', filteredMeetings);
    
    if (success) {
      res.json({ message: '会议删除成功' });
    } else {
      res.status(500).json({ error: '删除会议失败' });
    }
  } catch (error) {
    console.error('删除会议失败:', error);
    res.status(500).json({ error: '删除会议失败' });
  }
});

// 获取所有会员
app.get('/api/members', async (req, res) => {
  try {
    const members = await readJsonFile('member.json');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: '获取会员数据失败' });
  }
});

// 根据ID获取会员
app.get('/api/members/:id', async (req, res) => {
  try {
    const members = await readJsonFile('member.json');
    const member = members.find(m => m.id === req.params.id);
    if (member) {
      res.json(member);
    } else {
      res.status(404).json({ error: '会员未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: '获取会员数据失败' });
  }
});

// 创建或更新会员
app.post('/api/members', async (req, res) => {
  try {
    await ensureDataDir();
    const members = await readJsonFile('member.json');
    const memberData = req.body;
    
    // 检查是否已存在
    const existingIndex = members.findIndex(m => m.id === memberData.id);
    
    if (existingIndex >= 0) {
      // 更新现有会员
      members[existingIndex] = memberData;
    } else {
      // 创建新会员
      members.push(memberData);
    }
    
    // 保存到文件
    const success = await writeJsonFile('member.json', members);
    
    if (success) {
      res.json({ message: '会员保存成功', member: memberData });
    } else {
      res.status(500).json({ error: '保存会员失败' });
    }
  } catch (error) {
    console.error('保存会员失败:', error);
    res.status(500).json({ error: '保存会员失败' });
  }
});

// 更新会员
app.put('/api/members/:id', async (req, res) => {
  try {
    await ensureDataDir();
    const members = await readJsonFile('member.json');
    const memberData = req.body;
    
    // 检查是否已存在
    const existingIndex = members.findIndex(m => m.id === req.params.id);
    
    if (existingIndex >= 0) {
      // 更新现有会员
      members[existingIndex] = memberData;
      
      // 保存到文件
      const success = await writeJsonFile('member.json', members);
      
      if (success) {
        res.json({ message: '会员更新成功', member: memberData });
      } else {
        res.status(500).json({ error: '更新会员失败' });
      }
    } else {
      res.status(404).json({ error: '会员未找到' });
    }
  } catch (error) {
    console.error('更新会员失败:', error);
    res.status(500).json({ error: '更新会员失败' });
  }
});

// 删除会员
app.delete('/api/members/:id', async (req, res) => {
  try {
    const members = await readJsonFile('member.json');
    const filteredMembers = members.filter(m => m.id !== req.params.id);
    
    const success = await writeJsonFile('member.json', filteredMembers);
    
    if (success) {
      res.json({ message: '会员删除成功' });
    } else {
      res.status(500).json({ error: '删除会员失败' });
    }
  } catch (error) {
    console.error('删除会员失败:', error);
    res.status(500).json({ error: '删除会员失败' });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await readJsonFile('role.json');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: '获取角色数据失败' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await readJsonFile('project.json');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: '获取项目数据失败' });
  }
});

app.get('/api/venues', async (req, res) => {
  try {
    const venues = await readJsonFile('venue.json');
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: '获取场地数据失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 数据目录: ${DATA_DIR}`);
});

module.exports = app;
