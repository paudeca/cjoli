import useUid from "../hooks/useUid";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImageExifOrientation
);

const url = import.meta.env.VITE_API_URL;

const UploadImageInput = () => {
  const uid = useUid();
  const [files, setFiles] = useState<File[]>([]);
  const { t } = useTranslation();

  return (
    <FilePond
      files={files}
      onupdatefiles={(files) => setFiles(files.map((f) => f.file as File))}
      allowMultiple={false}
      maxFiles={1}
      server={`${url}/cjoli/${uid}/upload`}
      name="files"
      labelIdle={t("gallery.selectImage", "Click to select your image")}
      credits={false}
      acceptedFileTypes={["image/png", "image/jpeg"]}
      maxFileSize="10MB"
      instantUpload={true}
    />
  );
};

export default UploadImageInput;
