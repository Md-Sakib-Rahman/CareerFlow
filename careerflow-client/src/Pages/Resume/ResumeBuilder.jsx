import React, { useState, useEffect } from "react";
import { Upload, Trash2, Search, FileText, Download, X, AlertCircle, CheckCircle } from "lucide-react";

const ResumeBuilder = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [modal, setModal] = useState(false);
    const [file, setFile] = useState(null);
    const [cvType, setCvType] = useState("General");
    const [preview, setPreview] = useState(null);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}api/resume`;

    const showNotification = (message, type = "error") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL);
            const data = await res.json();
            setResumes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateFile = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        if (selectedFile.type !== "application/pdf") {
            showNotification("Only PDF files are allowed.");
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return showNotification("Please select a PDF file first.");

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("type", cvType);
        formData.append("name", file.name);

        try {
            setUploading(true);
            const res = await fetch(`${API_URL}/add`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const newResume = await res.json();
            setResumes((prev) => [newResume, ...prev]);
            setFile(null);
            setModal(false);
            showNotification("Resume uploaded successfully!", "success");
        } catch (err) {
            showNotification("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resume?")) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            setResumes((prev) => prev.filter((r) => r._id !== id));
            if (preview === resumes.find(r => r._id === id)?.fileUrl) setPreview(null);
            showNotification("Resume deleted successfully.", "success");
        } catch (err) {
            showNotification("Could not delete the resume.");
        }
    };

    const downloadPDF = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "resume.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, "_blank");
        }
    };

    const filtered = resumes.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">

            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <FileText size={24} />
                    </div>
                    RESUME VAULT
                </h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search resumes..."
                            className="pl-10 pr-4 py-2 border rounded-xl w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-200"
                    >
                        <Upload size={18} /> Upload
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border rounded-2xl overflow-hidden h-[750px] shadow-sm relative">
                    {preview ? (
                        <iframe
                            src={`${preview}#toolbar=0`}
                            className="w-full h-full"
                            title="Resume Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <div className="bg-gray-100 p-6 rounded-full">
                                <FileText size={60} />
                            </div>
                            <p className="text-xl font-medium">Select a file to preview</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="font-bold text-gray-700 mb-2 uppercase text-sm tracking-widest">My Resumes</h3>
                    {loading ? (
                        <div className="flex justify-center p-10"><span className="loading loading-dots loading-lg text-blue-600"></span></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                            No files found
                        </div>
                    ) : (
                        filtered.map((r) => (
                            <div
                                key={r._id}
                                onClick={() => setPreview(r.fileUrl)}
                                className={`group p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${preview === r.fileUrl
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-transparent bg-white hover:border-gray-200 shadow-sm"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-lg ${preview === r.fileUrl ? "bg-blue-500 text-white" : "bg-red-50 text-red-500"}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-gray-800 text-sm truncate w-32 md:w-40">{r.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">{r.type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadPDF(r.fileUrl, r.name); }}
                                        className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
                                        className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Add New Resume</h2>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Resume Type</label>
                                <select
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={cvType}
                                    onChange={(e) => setCvType(e.target.value)}
                                >
                                    <option>General</option>
                                    <option>Frontend</option>
                                    <option>Backend</option>
                                    <option>Remote</option>
                                </select>
                            </div>

                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={validateFile}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {file ? <span className="text-blue-600 font-bold">{file.name}</span> : "Drag & drop or click to upload PDF"}
                                    </p>
                                    <p className="text-xs text-gray-400">Max size: 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setModal(false)} className="flex-1 px-4 py-3 font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                disabled={uploading || !file}
                                onClick={handleUpload}
                                className={`flex-1 px-4 py-3 font-bold rounded-xl text-white transition-all shadow-lg ${uploading || !file ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                    }`}
                            >
                                {uploading ? "Uploading..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;