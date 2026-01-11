<?php
// Simple image upload script - saves images to /tmp
// Usage: open this file in a browser, choose an image and submit.

$result = null;
$maxBytes = 5 * 1024 * 1024; // 5 MB

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['image'])) {
        $result = 'No file input named "image" submitted.';
    } else {
        $file = $_FILES['image'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $result = 'Upload error code: ' . $file['error'];
        } elseif ($file['size'] > $maxBytes) {
            $result = 'File too large. Maximum is 5 MB.';
        } else {
            // Validate MIME type using finfo
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            $allowed = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/gif'  => 'gif',
                'image/webp' => 'webp',
            ];

            if (!array_key_exists($mime, $allowed)) {
                $result = 'Invalid file type: ' . htmlspecialchars($mime);
            } else {
                $target = '/tmp/upload.' . $allowed[$mime];

                if (move_uploaded_file($file['tmp_name'], $target)) {
                    @chmod($target, 0644);
                    $result = 'OK: file saved to ' . htmlspecialchars($target);
                } else {
                    $result = 'Failed to move uploaded file.';
                }
            }
        }
    }
}

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Upload image to /tmp</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .box { max-width: 540px; padding: 1rem; border: 1px solid #ddd; border-radius: 6px; }
        .result { margin: .5rem 0; padding: .5rem; background:#f7f7f7; border-radius:4px }
    </style>
</head>
<body>
    <div class="box">
        <h1>Upload image</h1>
        <?php if ($result !== null): ?>
            <div class="result"><?php echo $result; ?></div>
        <?php endif; ?>

        <form method="post" enctype="multipart/form-data">
            <div>
                <label for="image">Choose image (jpg, png, gif, webp, max 5MB):</label><br>
                <input type="file" name="image" id="image" accept="image/*" required>
            </div>
            <div style="margin-top:.8rem">
                <button type="submit">Upload</button>
            </div>
        </form>

        <p style="margin-top:.8rem; font-size: .9rem; color:#555">Saved uploads go to <code>/tmp</code> on the server.</p>
    </div>
</body>
</html>
