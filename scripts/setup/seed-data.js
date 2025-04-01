// Script to seed test data
async function seedTestData() {
  try {
    console.log('Seeding test data...');
    const response = await fetch('http://localhost:8787/api/seed-test-data');
    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Test data seeded successfully!');

      if (result.testUsers) {
        console.log('\n👤 Test Users:');
        console.log('- Alice:');
        console.log('  Email: alice@example.com');
        console.log('  Password: password123');
        console.log(
          `  Token: ${result.testUsers.alice.token.substring(0, 20)}...`
        );

        console.log('\n- Bob:');
        console.log('  Email: bob@example.com');
        console.log('  Password: password123');
        console.log(
          `  Token: ${result.testUsers.bob.token.substring(0, 20)}...`
        );
      }
    } else {
      console.error('❌ Failed to seed test data:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedTestData();
