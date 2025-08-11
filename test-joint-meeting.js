const axios = require('axios');

// 测试联合会议类型
async function testJointMeeting() {
  try {
    console.log('🧪 测试联合会议类型...');
    
    const jointMeeting = {
      id: 'MT-JOINT-TEST',
      date: new Date().toISOString(),
      meetingNumber: 999,
      theme: '联合会议测试',
      venue: 'VN01',
      type: 'joint', // 新的联合会议类型
      status: 'draft',
      assignments: [],
      speeches: [],
      visitors: [],
      attendees: [],
      notes: '这是一个联合会议测试'
    };

    console.log('📝 创建联合会议:', jointMeeting);
    
    // 发送POST请求创建联合会议
    const response = await axios.post('http://localhost:3001/api/meetings', jointMeeting);
    
    console.log('✅ 联合会议创建成功:', response.data);
    
    // 验证会议是否被正确保存
    const getResponse = await axios.get('http://localhost:3001/api/meetings');
    const meetings = getResponse.data;
    const savedMeeting = meetings.find(m => m.id === 'MT-JOINT-TEST');
    
    if (savedMeeting) {
      console.log('✅ 联合会议已保存到数据库:', savedMeeting);
      console.log('🎯 会议类型:', savedMeeting.type);
      console.log('📋 会议主题:', savedMeeting.theme);
    } else {
      console.log('❌ 联合会议未找到');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testJointMeeting();
