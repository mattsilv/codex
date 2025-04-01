// Simple tool to check registered users

const API_URL = 'http://localhost:8787';

async function checkUsers() {
  console.log('Checking registered users...');

  try {
    const response = await fetch(`${API_URL}/api/debug/users`);

    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.status}`);
    }

    const data = await response.json();

    console.log(`Total registered users: ${data.registeredCount}`);
    console.log('\nUSER DETAILS:');
    console.log('==============================================');

    data.registeredUsers.forEach((user, index) => {
      console.log(`USER ${index + 1}:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Deleted: ${user.markedForDeletion ? 'YES' : 'NO'}`);
      if (user.markedForDeletion) {
        console.log(`- Deleted at: ${user.deletedAt}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

// Run the check
checkUsers();
