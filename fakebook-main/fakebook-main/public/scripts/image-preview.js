// File: public/scripts/image-preview.js

document.addEventListener('DOMContentLoaded', function() {
  // Get the file input and image preview elements
  const fileInput = document.getElementById('avatar');
  const previewImage = document.getElementById('avatar-img');
  const avatarPreview = document.querySelector('.avatar-preview');
  
  // Default icon SVG (already in your HTML)
  const defaultIconSVG = avatarPreview.querySelector('svg');
  
  // Check if file input exists
  if (!fileInput || !previewImage || !avatarPreview) {
    console.error('Required elements not found for image preview');
    return;
  }
  
  // Function to handle image preview
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file && file.type.match('image.*')) {
      // Create a FileReader to read the image
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // Update the preview image source
        previewImage.src = e.target.result;
        
        // Show the image and hide the default icon
        previewImage.style.display = 'block';
        if (defaultIconSVG) {
          defaultIconSVG.style.display = 'none';
        }
        
        // Add a class to indicate an image is present
        avatarPreview.classList.add('has-image');
      };
      
      // Read the image file as a data URL
      reader.readAsDataURL(file);
    } else if (file) {
      // If file is not an image, show an error
      alert('Please select a valid image file');
      fileInput.value = '';
      
      // Reset preview
      resetPreview();
    }
  });
  
  // Check if there's already an image source (for edit functionality)
  if (previewImage.src && previewImage.src !== window.location.href) {
    // If image is not empty and not just the current page URL
    previewImage.style.display = 'block';
    if (defaultIconSVG) {
      defaultIconSVG.style.display = 'none';
    }
    avatarPreview.classList.add('has-image');
  } else {
    // Otherwise make sure the default state is correct
    resetPreview();
  }
  
  // Function to reset preview to default state
  function resetPreview() {
    previewImage.style.display = 'none';
    previewImage.src = '';
    if (defaultIconSVG) {
      defaultIconSVG.style.display = 'block';
    }
    avatarPreview.classList.remove('has-image');
  }
});