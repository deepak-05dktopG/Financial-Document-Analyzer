function DocumentUpload({ file, setFile, loading }) {
    const handleFileChange = (event) => {
        const selectedFile = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
        setFile(selectedFile);
    };

    return (
        <div className="mb-4">
            <label htmlFor="fileUpload" className="form-label field-label">
                Financial Document (PDF)
            </label>
            <input
                id="fileUpload"
                className="form-control form-control-lg input-soft"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={loading}
            />
            <div className="form-text">Only PDF files are supported.</div>
            {file ? <div className="selected-file mt-2">Selected: {file.name}</div> : null}
        </div>
    );
}

export default DocumentUpload;