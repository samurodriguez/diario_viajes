import "./style.css";
import { useState } from "react";
import List from "../List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const PreviewPhotosSlider = ({ entryPlace, filesInputRef }) => {
  const [photosPreview, setPhotosPreview] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const generatePreview = (e) => {
    const files = e.target.files;

    if (files.length > 3) {
      toast.error("Máximo 3 fotos por entrada");
    }

    // Vacío el array de fotos de preview (ya que al escoger unas nuevas, se borran las anteriores)
    photosPreview.splice(0, photosPreview.length);

    // Sustituyo cada foto nueva por un objeto Blob, que me permite previsualizarlas
    for (let i = 0; i < files.length; i++) {
      photosPreview.push(URL.createObjectURL(files[i]));
    }

    // Cambio el state por un array completamente nuevo, con el mismo contenido, para que React se entere de las modificaciones que acabamos de hacer en el estado (ya que no habíamos hecho un setState aún)
    setPhotosPreview([...photosPreview]);
    setCurrentPhoto(0);
  };

  const prevPhoto = () => {
    setCurrentPhoto(
      currentPhoto === 0 ? photosPreview.length - 1 : currentPhoto - 1
    );
  };

  const nextPhoto = () => {
    setCurrentPhoto(
      currentPhoto === photosPreview.length - 1 ? 0 : currentPhoto + 1
    );
  };

  return (
    <div className="entry_photos_slider">
      {photosPreview.length === 0 ? (
        <div className="entry_photos_empty">Añade fotos</div>
      ) : (
        <List
          className="photos_list"
          data={photosPreview}
          render={(photo, index) => (
            <div
              key={index}
              className={index === currentPhoto ? "slide active" : "slide"}
            >
              {index === currentPhoto && (
                <>
                  <img
                    src={photo}
                    alt={`Foto de ${entryPlace}`}
                    className="entry_photo"
                  ></img>
                  {photosPreview.length > 1 && (
                    <>
                      <FontAwesomeIcon icon={faArrowLeft} onClick={prevPhoto} />
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        onClick={nextPhoto}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        />
      )}
      <label className="entry_files_add" htmlFor="entry_files_input">
        <FontAwesomeIcon icon={faImages} />
      </label>
      <input
        id="entry_files_input"
        name="entry_files_input"
        type="file"
        multiple
        ref={filesInputRef}
        onChange={generatePreview}
        accept="image/*"
      />
    </div>
  );
};

export default PreviewPhotosSlider;
