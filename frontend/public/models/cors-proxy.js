// Simple CORS proxy for handling image loading issues
// This script can be included in your HTML to help with CORS issues

// Function to create a CORS-friendly URL
function createCorsProxyUrl(originalUrl) {
  // If the URL is already from a CORS-friendly source, return it as is
  if (originalUrl.includes('pexels.com')) {
    return originalUrl;
  }
  
  // For S3 images, we can try using a different approach
  if (originalUrl.includes('amazonaws.com')) {
    // Try replacing the direct S3 URL with the CloudFront URL if available
    return originalUrl.replace(
      'kinderloop-app-demo.s3.amazonaws.com', 
      'd2isva7xmlrxtz.cloudfront.net'
    );
  }
  
  // Fallback to a placeholder image if we can't handle the URL
  if (originalUrl.includes('amazonaws.com')) {
    return 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
  }
  
  return originalUrl;
}

// Make the function available globally
window.createCorsProxyUrl = createCorsProxyUrl;