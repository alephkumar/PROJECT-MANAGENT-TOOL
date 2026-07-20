import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import projectService from '../services/projectService';
import ProjectForm from '../components/projects/ProjectForm';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = await projectService.create(formData);
      toast.success('Project created successfully');
      navigate(`/projects/${data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects" className="text-muted flex items-center gap-8" style={{ fontSize: '0.85rem', marginBottom: 8 }}>
            <FiArrowLeft /> Back to Projects
          </Link>
          <h1 className="page-title">Create New Project</h1>
        </div>
      </div>

      <div className="card card-body" style={{ maxWidth: 640 }}>
        <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" loading={loading} />
      </div>
    </div>
  );
};

export default CreateProject;
