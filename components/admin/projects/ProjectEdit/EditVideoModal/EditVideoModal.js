/**
 *
 * EditVideoModal
 *
 */
import React, { useContext } from 'react';

import FileSection from 'components/admin/projects/ProjectEdit/EditVideoModal/ModalSections/FileSection/FileSection';
import UnitDataForm from 'components/admin/projects/ProjectEdit/EditVideoModal/ModalForms/UnitDataForm/UnitDataForm';
import VideoUnitCarousel from 'components/admin/projects/ProjectEdit/EditVideoModal/ModalSections/VideoUnitCarousel/VideoUnitCarousel';
import { EditSingleProjectItemContext } from 'components/admin/projects/ProjectEdit/EditSingleProjectItem/EditSingleProjectItem';

import './EditVideoModal.scss';


const EditVideoModal = () => {
  const { language, selectedFile, selectedUnit } = useContext( EditSingleProjectItemContext );

  return (
    <div className="edit-video-modal">
      <UnitDataForm language={ language } fileId={ selectedFile } unitId={ selectedUnit } />
      <FileSection />
      <VideoUnitCarousel />
    </div>
  );
};

export default EditVideoModal;
