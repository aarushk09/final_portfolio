#!/usr/bin/env node

/**
 * Filebrowser Setup Helper Script
 * 
 * This script helps you:
 * 1. Test connection to your Filebrowser instance
 * 2. Authenticate and get a token
 * 3. Create a public share for your portfolio folder
 * 4. Generate the environment variables you need
 * 
 * Usage: node scripts/setup-filebrowser.js
 */

import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

interface Config {
  url: string;
  username: string;
  password: string;
  photosPath: string;
}

async function main() {
  console.log('\n🚀 Filebrowser Setup Helper\n');
  console.log('This script will help you configure Filebrowser for your portfolio.\n');

  // Collect configuration
  const config: Config = {
    url: await question('Enter your Filebrowser URL (e.g., http://192.168.1.100:8080): '),
    username: await question('Enter your Filebrowser username (default: admin): ') || 'admin',
    password: await question('Enter your Filebrowser password: '),
    photosPath: await question('Enter the photos directory path (default: /my_data/portfolio_pics): ') || '/my_data/portfolio_pics'
  };

  // Remove trailing slash from URL
  config.url = config.url.replace(/\/$/, '');

  console.log('\n📡 Testing connection...\n');

  try {
    // Test connection
    const healthResponse = await fetch(`${config.url}/health`);
    if (!healthResponse.ok) {
      throw new Error('Health check failed');
    }
    console.log('✅ Connection successful!\n');

    // Authenticate
    console.log('🔐 Authenticating...\n');
    const authResponse = await fetch(`${config.url}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
        recaptcha: ''
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status} ${authResponse.statusText}`);
    }

    const token = await authResponse.text();
    console.log('✅ Authentication successful!\n');
    console.log(`🔑 Your API Token: ${token}\n`);

    // Test file listing
    console.log('📂 Testing file access...\n');
    const filesResponse = await fetch(`${config.url}/api/resources${config.photosPath}`, {
      method: 'GET',
      headers: { 'X-Auth': token }
    });

    if (!filesResponse.ok) {
      throw new Error(`Failed to list files: ${filesResponse.status} ${filesResponse.statusText}`);
    }

    const filesData = await filesResponse.json();
    const imageCount = filesData.items?.filter((item: any) => 
      !item.isDir && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
    ).length || 0;

    console.log(`✅ Found ${imageCount} images in ${config.photosPath}\n`);

    // Create public share
    const createShare = await question('Do you want to create a public share? (recommended) (y/n): ');
    
    let shareHash = '';
    if (createShare.toLowerCase() === 'y') {
      console.log('\n🔗 Creating public share...\n');
      
      const shareResponse = await fetch(`${config.url}/api/share${config.photosPath}`, {
        method: 'POST',
        headers: {
          'X-Auth': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!shareResponse.ok) {
        console.error('❌ Failed to create share:', shareResponse.status);
      } else {
        const shareData = await shareResponse.json();
        shareHash = shareData.hash;
        console.log(`✅ Public share created!\n`);
        console.log(`📎 Share URL: ${config.url}/share/${shareHash}\n`);
      }
    }

    // Generate environment variables
    console.log('\n📝 Environment Variables\n');
    console.log('Copy these to your .env.local file:\n');
    console.log('─'.repeat(60));
    console.log(`FILEBROWSER_URL=${config.url}`);
    console.log(`FILEBROWSER_PHOTOS_PATH=${config.photosPath}`);
    console.log(`FILEBROWSER_TOKEN=${token}`);
    
    if (shareHash) {
      console.log(`FILEBROWSER_PUBLIC_SHARE_ENABLED=true`);
      console.log(`FILEBROWSER_SHARE_HASH=${shareHash}`);
    } else {
      console.log(`FILEBROWSER_PUBLIC_SHARE_ENABLED=false`);
      console.log(`# FILEBROWSER_SHARE_HASH=`);
    }
    console.log('─'.repeat(60));

    console.log('\n✨ Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Add the environment variables to your .env.local file');
    console.log('2. Restart your development server: npm run dev');
    console.log('3. Visit http://localhost:3000/api/photos to test\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nTroubleshooting:');
    console.log('- Verify Filebrowser is running and accessible');
    console.log('- Check your username and password');
    console.log('- Verify the photos directory exists');
    console.log('- Check firewall settings\n');
  } finally {
    rl.close();
  }
}

main();

