// Test script to verify API endpoints
console.log('Testing Twitter API endpoints...');

// Test health endpoint
fetch('http://localhost:8000/api/v1/health')
  .then(response => response.json())
  .then(data => {
    console.log('Health check:', data);
  })
  .catch(error => {
    console.error('Health check failed:', error);
  });

// Test search users endpoint (you'll need to replace with actual API key)
const testSearchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/twitter/search/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here' // Replace with actual API key
      },
      body: JSON.stringify({
        name: 'test',
        limit: 5
      })
    });
    
    const data = await response.json();
    console.log('Search users response:', data);
    
    if (data.data && data.data.task_id) {
      console.log('Task ID:', data.data.task_id);
      
      // Test task status endpoint
      setTimeout(async () => {
        try {
          const taskResponse = await fetch(`http://localhost:8000/api/v1/twitter/tasks/${data.data.task_id}`, {
            headers: {
              'X-API-Key': 'your-api-key-here' // Replace with actual API key
            }
          });
          const taskData = await taskResponse.json();
          console.log('Task status response:', taskData);
        } catch (error) {
          console.error('Task status check failed:', error);
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Search users failed:', error);
  }
};

// Uncomment to test (after setting API key)
// testSearchUsers();
