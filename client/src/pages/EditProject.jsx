import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import projectService from '../services/projectService';
import ProjectForm from '../components/projects/ProjectForm';
import Spinner from '../components/common/Spinner';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectService.getById(id);
        setProject(data.project);
      } catch (err) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await projectService.update(id, formData);
      toast.success('Project updated successfully');
      navigate(`/projects/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner center />;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link
            to={`/projects/${id}`}
            className="text-muted flex items-center gap-8"
            style={{ fontSize: '0.85rem', marginBottom: 8 }}
          >
            <FiArrowLeft /> Back to Project
          </Link>
          <h1 className="page-title">Edit Project</h1>
        </div>
      </div>

      <div className="card card-body" style={{ maxWidth: 640 }}>
        <ProjectForm
          initialData={project}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EditProject;
