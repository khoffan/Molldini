// ไฟล์: src/services/cloudinaryService.ts

export const uploadToCloudinary = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'molldini'); // ที่ตั้งไว้ในขั้นตอนที่ 1
    const targetFolder = `molldini/${folder}`;
    formData.append('folder', targetFolder); // ชื่อโฟลเดอร์ใน Cloudinary

    const cloudName = 'dy5dc3gow'; // ดูได้จากหน้า Dashboard

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        
        const data = await response.json();
        
        console.log(data);
        // Return ค่าให้เหมือนโครงสร้างเดิมที่คุณเคยใช้ใน Firebase
        return {
            url: data.secure_url,        // URL ของรูป (HTTPS)
            path: data.public_id,        // ID ของไฟล์ (ใช้สำหรับลบหรือแก้ไข)
            fileName: `${data.original_filename}.${data.format}`,
            mimeType: `${data.resource_type}/${data.format}`,
            size: data.bytes,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};