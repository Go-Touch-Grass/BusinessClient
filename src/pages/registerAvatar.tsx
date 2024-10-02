import { Button } from "@/components/components/ui/button";
import GLBAxiosInstance from "@/network/axiosClient";
import { useState } from "react";

const RegisterAvatar = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setButtonDisabled(false);
    }
  };

  const handleSubmitFile = async () => {
    const formData = new FormData();
    if (file) {
      formData.append("name", ".glb model");
      formData.append("avatarFile", file);
    }
    try {
      const { data } = await GLBAxiosInstance.post(
        "http://localhost:8080/api/business/avatarRequest",
        { business_id: 10, avatarFile: formData }
      );
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <p>upload avatar model for request</p>
      <p>.glb files only</p>
      <input type="file" accept=".glb" onChange={handleFileChange} required />
      <Button onClick={handleSubmitFile} disabled={buttonDisabled}>
        Submit
      </Button>
    </div>
  );
};

export default RegisterAvatar;
