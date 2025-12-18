require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const BASE_FOLDER = 'yt-automation-qtov';

async function organizeCloudinaryAssets() {
  console.log('=== Organizing Cloudinary Assets ===\n');
  
  try {
    // Get all videos from root
    const allVideos = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      max_results: 500
    });

    console.log(`Found ${allVideos.resources.length} total files in Cloudinary\n`);

    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const musicExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

    let videosMoved = 0;
    let musicMoved = 0;
    let skipped = 0;

    for (const resource of allVideos.resources) {
      const publicId = resource.public_id;
      const format = resource.format.toLowerCase();
      
      // Skip if already in organized folder
      if (publicId.startsWith(BASE_FOLDER + '/') || publicId.startsWith('samples/')) {
        console.log(`⏭️  Skipping: ${publicId} (already organized or sample)`);
        skipped++;
        continue;
      }

      let targetFolder = null;
      
      if (videoExtensions.includes(format)) {
        targetFolder = `${BASE_FOLDER}/videos`;
      } else if (musicExtensions.includes(format)) {
        targetFolder = `${BASE_FOLDER}/music`;
      }

      if (targetFolder) {
        const fileName = publicId.split('/').pop();
        const newPublicId = `${targetFolder}/${fileName}`;
        
        console.log(`📦 Moving: ${publicId} → ${newPublicId}`);
        
        try {
          await cloudinary.uploader.rename(
            publicId,
            newPublicId,
            { resource_type: 'video', invalidate: true }
          );
          
          if (videoExtensions.includes(format)) {
            videosMoved++;
            console.log(`✅ Moved video successfully`);
          } else {
            musicMoved++;
            console.log(`✅ Moved music successfully`);
          }
        } catch (error) {
          console.error(`❌ Failed to move ${publicId}: ${error.message}`);
        }
      }
      
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`Videos moved: ${videosMoved}`);
    console.log(`Music moved: ${musicMoved}`);
    console.log(`Skipped: ${skipped}`);
    console.log('\n✅ Organization complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

organizeCloudinaryAssets();
