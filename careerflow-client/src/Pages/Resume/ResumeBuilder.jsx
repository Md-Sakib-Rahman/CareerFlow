import React, { useState, useEffect } from "react";
import { Upload, Trash2, Search } from "lucide-react";

const ResumeBuilder = () => {
    const [resumes, setResumes] = useState([]);
    const [modal, setModal] = useState(false);
    const [file, setFile] = useState(null);
    const [cvType, setCvType] = useState("General");
    const [preview, setPreview] = useState(null);
    const [search, setSearch] = useState("");

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}api/resume`;

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setResumes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFile = (f) => {
        if (!f) return;
        if (f.type !== "application/pdf") return alert("Only PDF allowed");
        setFile(f);
    };

    const handleInputChange = (e) => handleFile(e.target.files[0]);
    const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

    const handleUpload = async () => {
        if (!file) return alert("Select PDF");

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("type", cvType);

        try {
            const res = await fetch(`${API_URL}/add`, { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const newResume = await res.json();
            setResumes([newResume, ...resumes]);
            setFile(null);
            setModal(false);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete?")) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            setResumes(resumes.filter(r => r._id !== id));
            if (preview && preview.includes(id)) setPreview(null);
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const filtered = resumes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Resume Vault</h1>

            <div className="flex justify-between mb-6">
                <div className="flex items-center gap-2 border px-3 py-2 rounded">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search Resume..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="outline-none"
                    />
                </div>

                <button className="btn btn-primary flex gap-2" onClick={() => setModal(true)}>
                    <Upload size={18} /> Upload Resume
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 border rounded-lg h-[600px]">
                    {preview ? (
                        <iframe src={preview} className="w-full h-full" title="preview" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select resume to preview
                        </div>
                    )}
                </div>

                <div className="space-y-3 max-h-[600px] overflow-auto">
                    {filtered.map(r => (
                        <div key={r._id} className="border p-3 rounded-lg flex justify-between items-center">
                            <div className="cursor-pointer" onClick={() => setPreview(r.fileUrl)}>
                                <p className="font-semibold">{r.name}</p>
                                <p className="text-xs opacity-60">{r.type}</p>
                            </div>

                            <div className="flex gap-2">
                                <a href={r.fileUrl} target="_blank" className="btn btn-xs">Download</a>
                                <button onClick={() => handleDelete(r._id)} className="btn btn-xs btn-error">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-base-100 p-6 rounded-lg w-[420px]" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                        <h2 className="text-xl mb-4">Upload Resume</h2>
                        <select className="select select-bordered w-full mb-4" value={cvType} onChange={e => setCvType(e.target.value)}>
                            <option>General</option>
                            <option>Frontend</option>
                            <option>Backend</option>
                            <option>Remote</option>
                        </select>
                        <div className="border-dashed border-2 p-6 text-center mb-4 rounded">
                            Drag & Drop PDF Here
                            <div className="mt-3">
                                <input type="file" accept="application/pdf" onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button className="btn" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;