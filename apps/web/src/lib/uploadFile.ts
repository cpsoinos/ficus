/**
 * Uploads a file to the specified URL using an XMLHttpRequest.
 *
 * This function initiates an HTTP POST request to upload the provided file. It sets
 * the request headers with the file's name and type, and tracks the upload progress
 * by periodically calling the supplied callback function with the current progress percentage.
 *
 * @param file - The File object to be uploaded.
 * @param url - The endpoint URL to which the file will be uploaded.
 * @param onProgress - A callback function that receives the current upload progress as a percentage.
 *
 * @returns A Promise that resolves with the parsed JSON response upon successful upload,
 *          or rejects with an error if the upload fails.
 */
export function uploadFile(file: File, url: string, onProgress: (progress: number) => void) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('X-File-Name', file.name);
		xhr.setRequestHeader('Content-Type', file.type);
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				const percent = Math.round((event.loaded / event.total) * 100);
				onProgress(percent);
			}
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(JSON.parse(xhr.responseText));
			} else {
				reject(new Error(`Upload failed with status ${xhr.status}`));
			}
		};
		xhr.onerror = () => reject(new Error('Upload error'));
		xhr.send(file);
	});
}
