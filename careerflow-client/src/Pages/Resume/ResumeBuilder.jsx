import React, { useEffect, useState } from "react";
import { Upload, Trash2, Search, FileText, Download, X, Edit, Filter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUserJobs } from "../../Redux/board/boardSlice";

const ResumeBuilder = () => {
    const dispatch = useDispatch();
    const { allJobs } = useSelector((state) => state.board);

    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedJob, setSelectedJob] = useState("General");
    const [preview, setPreview] = useState(null);
    const [modal, setModal] = useState(false);
    const [editingResume, setEditingResume] = useState(null);
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);
    
    //  Filter State and Time Filter
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [timeFilter, setTimeFilter] = useState("All");

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}api/resume`;

    useEffect(() => {
        dispatch(fetchAllUserJobs());
        fetchResumes();
    }, [dispatch]);

    const fetchResumes = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setResumes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const validateFile = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        if (selected.type !== "application/pdf") {
            alert("Only PDF allowed");
            return;
        }
        setFile(selected);
    };

    const handleUpload = async () => {
        if (!file && !editingResume) return alert("Select a PDF file");

        const formData = new FormData();
        if (file) {
            formData.append("resume", file);
        }

        const jobTitle = selectedJob === "General"
            ? "General"
            : allJobs.find(j => j._id === selectedJob)?.title;

        formData.append("type", jobTitle || "General");
        formData.append("jobId", selectedJob);

        try {
            setUploading(true);
            const endpoint = editingResume ? `${API_URL}/${editingResume._id}` : `${API_URL}/add`;
            const method = editingResume ? "PATCH" : "POST";

            const res = await fetch(endpoint, {
                method,
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Something went wrong");
            }

            const data = await res.json();

            if (editingResume) {
                setResumes(prev => prev.map(r => r._id === data._id ? data : r));
            } else {
                setResumes(prev => [data, ...prev]);
            }

            closeModal();
            alert("Resume saved successfully!");
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setUploading(false);
        }
    };

    const closeModal = () => {
        setModal(false);
        setFile(null);
        setSelectedJob("General");
        setEditingResume(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this resume?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
                setResumes(prev => prev.filter(r => r._id !== id));
                if (preview?.includes(id)) setPreview(null);
            }
        } catch (err) {
            alert("Delete failed");
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
            link.remove();
        } catch (err) {
            alert("Download failed");
        }
    };

    const openEditModal = (resume) => {
        setEditingResume(resume);
        setSelectedJob(resume.jobId?._id || resume.jobId || "General");
        setModal(true);
    };

    // Search + Category Filter Logic
    const filtered = resumes.filter((r) => {
        const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "All" || r.type === categoryFilter;

        const now = new Date();
        const uploadDate = new Date(r.uploadedAt);

        let matchesTime = true;

        if (timeFilter === "Today") {
            matchesTime = uploadDate.toDateString() === now.toDateString();
        }

        if (timeFilter === "Week") {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            matchesTime = uploadDate >= weekAgo;
        }

        if (timeFilter === "Month") {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            matchesTime = uploadDate >= monthAgo;
        }

        return matchesSearch && matchesCategory && matchesTime;
    });

    // Get Unique Categories for Dropdown
    const uniqueCategories = ["All", ...new Set(resumes.map(r => r.type))];

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-blue-600" /> Resume Vault
                </h1>
                <button
                    onClick={() => { setEditingResume(null); setModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                >
                    <Upload size={18} /> Upload New
                </button>
            </div>

            {/* Search and Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search resume by name..."
                        className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <select
                        className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm appearance-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {/* Time Filter */}
                <div className="relative">
                    <select
                        className="pl-4 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Week">This Week</option>
                        <option value="Month">This Month</option>
                    </select>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Preview Section */}
                <div className="col-span-12 lg:col-span-8 border rounded-2xl h-[650px] bg-white shadow-sm overflow-hidden relative">
                    {preview ? (
                        <iframe src={`${preview}#toolbar=0`} className="w-full h-full" title="Resume Preview" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FileText size={48} className="mb-2 opacity-20" />
                            <p>Select a resume from the list to preview</p>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="col-span-12 lg:col-span-4 space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs font-bold text-gray-400 uppercase ml-1">
                        Showing {filtered.length} Resumes
                    </p>
                    {filtered.length > 0 ? filtered.map((r) => (
                        <div
                            key={r._id}
                            className={`group border p-3 rounded-xl flex justify-between items-center transition-all bg-white hover:border-blue-500 shadow-sm ${preview === r.fileUrl ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                        >
                            <div onClick={() => setPreview(r.fileUrl)} className="cursor-pointer flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate pr-2 text-gray-700">{r.name}</p>
                                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">{r.type}</p>
                            </div>

                            <div className="flex gap-1">
                                <button onClick={() => openEditModal(r)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => downloadPDF(r.fileUrl, r.name)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Download size={16} />
                                </button>
                                <button onClick={() => handleDelete(r._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400 italic bg-white rounded-xl border border-dashed">No resumes found</div>
                    )}
                </div>
            </div>

            {/* Modal - Code remains same as yours but with closeModal helper */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{editingResume ? "Update Resume" : "Upload Resume"}</h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Link to Job Application</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 bg-gray-50"
                                    value={selectedJob}
                                    onChange={e => setSelectedJob(e.target.value)}
                                >
                                    <option value="General">General (Default)</option>
                                    {allJobs?.map(job => (
                                        <option key={job._id} value={job._id}>
                                            {job.title} at {job.company}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Resume File (PDF)</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={validateFile}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">
                                        {file ? <span className="text-blue-600 font-medium">{file.name}</span> : "Click or drag to upload PDF"}
                                    </p>
                                </div>
                                {editingResume && !file && (
                                    <p className="text-[10px] text-orange-500 mt-1 italic">* Leave blank to keep the current file</p>
                                )}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:bg-blue-300"
                            >
                                {uploading ? "Processing..." : editingResume ? "Save Changes" : "Start Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;