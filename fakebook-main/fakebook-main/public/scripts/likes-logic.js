document.addEventListener('DOMContentLoaded', () => {
  console.log('Like buttons found:', document.querySelectorAll('.likebutton').length);
  
  document.querySelectorAll('.likebutton').forEach((button) => {
    const postId = button.getAttribute('data-post-id');
    console.log('Button found with postId:', postId);
    
    button.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent any default form submission
      const postId = button.getAttribute('data-post-id');
      const csrfToken = button.getAttribute('data-csrf');
      console.log('Button clicked, postId:', postId);
      console.log('CSRF Token:', csrfToken);
      
      if (!postId) {
        console.error('Post ID is missing!');
        return;
      }

      // Check if the post is already liked
      const isLiked = button.classList.contains('liked');
      const url = isLiked ? `/unlikePost/${postId}` : `/likePost/${postId}`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.success) {
          // Toggle the liked state
          button.classList.toggle('liked');
          
          // Update the like count
          button.querySelector('.likeCount').textContent = result.likeCount;
          
          // Optionally change button text/appearance based on liked state
          if (button.classList.contains('liked')) {
            button.querySelector('.likeText').textContent = 'Unlike';
          } else {
            button.querySelector('.likeText').textContent = 'Like';
          }
          
          console.log('Like count updated to:', result.likeCount);
        } else {
          console.error('Error from server:', result.message);
        }
      } catch (error) {
        console.error(`Error ${isLiked ? 'unliking' : 'liking'} post:`, error);
      }
    });
  });
});