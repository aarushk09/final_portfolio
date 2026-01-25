/**
 * Filebrowser Connection Test Script
 * 
 * This script validates your Filebrowser setup without starting the full Next.js server.
 * Run this to quickly test if your configuration is working.
 * 
 * Usage: 
 *   npm run test:filebrowser
 *   OR
 *   node --loader ts-node/esm scripts/test-filebrowser.ts
 */

import { FilebrowserClient, getFallbackImages } from '../lib/filebrowser';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} ${result.name}`);
  if (result.message) {
    console.log(`   ${result.message}`);
  }
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
  console.log('');
}

async function runTests() {
  console.log('\n🧪 Filebrowser Configuration Test\n');
  console.log('='.repeat(60));
  console.log('');

  // Test 1: Environment Variables
  console.log('📋 Test 1: Environment Variables\n');
  
  const filebrowserUrl = process.env.FILEBROWSER_URL;
  const photosPath = process.env.FILEBROWSER_PHOTOS_PATH || '/my_data/portfolio_pics';
  const token = process.env.FILEBROWSER_TOKEN;
  const username = process.env.FILEBROWSER_USERNAME;
  const password = process.env.FILEBROWSER_PASSWORD;
  const usePublicShare = process.env.FILEBROWSER_PUBLIC_SHARE_ENABLED === 'true';
  const shareHash = process.env.FILEBROWSER_SHARE_HASH;

  if (!filebrowserUrl) {
    logTest({
      name: 'FILEBROWSER_URL',
      status: 'fail',
      message: 'Not configured in .env.local'
    });
    console.log('❌ Cannot continue without FILEBROWSER_URL. Exiting.\n');
    return;
  }

  logTest({
    name: 'FILEBROWSER_URL',
    status: 'pass',
    message: filebrowserUrl
  });

  logTest({
    name: 'FILEBROWSER_PHOTOS_PATH',
    status: 'pass',
    message: photosPath
  });

  // Check authentication config
  const hasToken = !!token;
  const hasCredentials = !!(username && password);
  
  if (!hasToken && !hasCredentials && !usePublicShare) {
    logTest({
      name: 'Authentication Config',
      status: 'fail',
      message: 'No authentication method configured (need token, credentials, or public share)'
    });
  } else {
    const authMethods = [];
    if (hasToken) authMethods.push('Token');
    if (hasCredentials) authMethods.push('Username/Password');
    if (usePublicShare) authMethods.push('Public Share');
    
    logTest({
      name: 'Authentication Config',
      status: 'pass',
      message: `Configured: ${authMethods.join(', ')}`
    });
  }

  // Test 2: Health Check
  console.log('🏥 Test 2: Health Check\n');
  
  try {
    const healthResponse = await fetch(`${filebrowserUrl}/health`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (healthResponse.ok) {
      logTest({
        name: 'Filebrowser Health',
        status: 'pass',
        message: 'Filebrowser is accessible'
      });
    } else {
      logTest({
        name: 'Filebrowser Health',
        status: 'fail',
        message: `Health check returned: ${healthResponse.status}`
      });
    }
  } catch (error) {
    logTest({
      name: 'Filebrowser Health',
      status: 'fail',
      message: `Cannot reach Filebrowser: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: 'Check URL, network connection, and firewall'
    });
  }

  // Test 3: Public Share (if enabled)
  if (usePublicShare) {
    console.log('🔗 Test 3: Public Share Access\n');
    
    if (!shareHash) {
      logTest({
        name: 'Public Share Hash',
        status: 'fail',
        message: 'FILEBROWSER_PUBLIC_SHARE_ENABLED is true but FILEBROWSER_SHARE_HASH is not set'
      });
    } else {
      logTest({
        name: 'Public Share Hash',
        status: 'pass',
        message: `Hash: ${shareHash}`
      });

      try {
        const files = await FilebrowserClient.listPublicShareFiles(
          `${filebrowserUrl}/share/${shareHash}`
        );
        
        const imageFiles = files.filter((f: any) => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
        );

        logTest({
          name: 'Public Share Access',
          status: 'pass',
          message: `Found ${imageFiles.length} images`,
          details: imageFiles.slice(0, 5).map((f: any) => f.name)
        });
      } catch (error) {
        logTest({
          name: 'Public Share Access',
          status: 'fail',
          message: `Failed to access public share: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: 'Verify share hash is correct and share still exists'
        });
      }
    }
  }

  // Test 4: Authentication (if using token/credentials)
  if (!usePublicShare && (hasToken || hasCredentials)) {
    console.log('🔐 Test 4: Authentication\n');

    try {
      const client = new FilebrowserClient({
        baseUrl: filebrowserUrl,
        token: token,
        username: username,
        password: password,
      });

      const photos = await client.getPortfolioPhotos(photosPath);

      logTest({
        name: 'Authentication & File Access',
        status: 'pass',
        message: `Successfully authenticated and found ${photos.length} images`,
        details: photos.slice(0, 5).map(p => p.name)
      });
    } catch (error) {
      logTest({
        name: 'Authentication & File Access',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: 'Check credentials, token, and directory path'
      });
    }
  }

  // Test 5: Fallback Images
  console.log('🖼️  Test 5: Fallback Images\n');
  
  try {
    const fallbacks = getFallbackImages();
    
    if (fallbacks.length > 0) {
      logTest({
        name: 'Fallback Images',
        status: 'pass',
        message: `${fallbacks.length} fallback images configured`,
        details: fallbacks.map(f => f.url)
      });
    } else {
      logTest({
        name: 'Fallback Images',
        status: 'fail',
        message: 'No fallback images configured'
      });
    }
  } catch (error) {
    logTest({
      name: 'Fallback Images',
      status: 'fail',
      message: 'Error checking fallback images'
    });
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Test Summary\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📝 Total: ${results.length}\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Your Filebrowser configuration is ready.\n');
    console.log('Next steps:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000/api/photos');
    console.log('3. Check your gallery page\n');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues above and run again.\n');
    console.log('Common fixes:');
    console.log('- Verify FILEBROWSER_URL is correct and accessible');
    console.log('- Check authentication credentials/token');
    console.log('- Verify FILEBROWSER_PHOTOS_PATH exists');
    console.log('- For public share: verify hash is correct\n');
  }

  return failed === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });

