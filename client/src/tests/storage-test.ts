export async function testStorageSetup() {
  console.log('🧪 Starting Storage Tests...\n');

  // Import supabase dynamically to avoid environment variable issues
  const { supabase } = await import('@/lib/supabase');

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('❌ No user logged in. Please login first.');
    return;
  }

  console.log('✅ User authenticated:', user.id);

  const testModelId = 'test-model-' + Date.now();
  const testFilePath = `${user.id}/${testModelId}/test-file.txt`;

  // Test 1: Upload File
  console.log('\n📤 Test 1: Uploading file...');
  const fileContent = 'Storage test content - ' + new Date().toISOString();
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const file = new File([blob], 'test-file.txt', { type: 'text/plain' });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('model-files')
    .upload(testFilePath, file, { upsert: true });

  if (uploadError) {
    console.error('❌ Test 1 FAILED:', uploadError.message);
    return;
  }
  console.log('✅ Test 1 PASSED: File uploaded successfully');

  // Test 2: List Files
  console.log('\n📂 Test 2: Listing files...');
  const { data: listData, error: listError } = await supabase.storage
    .from('model-files')
    .list(`${user.id}/${testModelId}`);

  if (listError) {
    console.error('❌ Test 2 FAILED:', listError.message);
  } else {
    console.log('✅ Test 2 PASSED: Files listed:', listData.length, 'files');
    console.log('Files:', listData.map(f => f.name));
  }

  // Test 3: Generate Signed URL
  console.log('\n🔗 Test 3: Generating signed URL...');
  const { data: signedData, error: signedError } = await supabase.storage
    .from('model-files')
    .createSignedUrl(testFilePath, 3600);

  if (signedError) {
    console.error('❌ Test 3 FAILED:', signedError.message);
  } else {
    console.log('✅ Test 3 PASSED: Signed URL created');
    console.log('URL:', signedData.signedUrl);
  }

  // Test 4: Download File
  console.log('\n📥 Test 4: Downloading file...');
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from('model-files')
    .download(testFilePath);

  if (downloadError) {
    console.error('❌ Test 4 FAILED:', downloadError.message);
  } else {
    const text = await downloadData.text();
    console.log('✅ Test 4 PASSED: File downloaded');
    console.log('Content matches:', text === fileContent);
  }

  // Test 5: Try Unauthorized Upload
  console.log('\n🚫 Test 5: Testing unauthorized upload...');
  const wrongPath = `different-user-123/model-456/test.txt`;
  const { error: unauthorizedError } = await supabase.storage
    .from('model-files')
    .upload(wrongPath, file);

  if (unauthorizedError) {
    console.log('✅ Test 5 PASSED: Unauthorized upload correctly blocked');
  } else {
    console.error('❌ Test 5 FAILED: Security issue - unauthorized upload succeeded!');
  }

  // Test 6: Delete File
  console.log('\n🗑️  Test 6: Deleting file...');
  const { error: deleteError } = await supabase.storage
    .from('model-files')
    .remove([testFilePath]);

  if (deleteError) {
    console.error('❌ Test 6 FAILED:', deleteError.message);
  } else {
    console.log('✅ Test 6 PASSED: File deleted successfully');
  }

  console.log('\n🎉 All storage tests complete!\n');
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testStorage = testStorageSetup;
}