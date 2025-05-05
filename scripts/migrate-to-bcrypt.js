const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function migrateToBcrypt() {
  try {
    console.log('Starting password migration to bcrypt...');
    
    // 读取用户数据文件
    const dataFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(fileData);
    
    let migrationCount = 0;
    const saltRounds = 10;
    
    // 遍历所有用户并更新密码
    const migratedUsers = await Promise.all(users.map(async (user) => {
      if (user.password) {
        try {
          // 解码当前base64格式的密码
          const base64Password = user.password;
          const reversedPassword = Buffer.from(base64Password, 'base64').toString();
          const originalPassword = reversedPassword.split('').reverse().join('');
          
          // 使用bcrypt创建新的哈希
          user.password = await bcrypt.hash(originalPassword, saltRounds);
          migrationCount++;
          
          console.log(`Migrated password for user: ${user.email}`);
        } catch (error) {
          console.error(`Failed to migrate password for user: ${user.email}`, error);
        }
      }
      return user;
    }));
    
    // 保存更新后的用户数据
    if (migrationCount > 0) {
      fs.writeFileSync(dataFilePath, JSON.stringify(migratedUsers, null, 2), 'utf8');
      console.log(`Password migration completed. Migrated ${migrationCount} passwords to bcrypt.`);
    } else {
      console.log('No passwords needed migration.');
    }
    
    return { success: true, migratedCount: migrationCount };
  } catch (error) {
    console.error('Password migration failed:', error);
    return { success: false, error: error.message };
  }
}

// 执行迁移
migrateToBcrypt().then(result => {
  if (result.success) {
    console.log('Migration completed successfully!');
    process.exit(0);
  } else {
    console.error('Migration failed:', result.error);
    process.exit(1);
  }
});