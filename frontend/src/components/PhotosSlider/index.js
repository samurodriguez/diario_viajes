import "./style.css";
import { useState, useRef, useEffect } from "react";
import List from "../List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const PhotosSlider = ({
  entryId,
  entryPhotos,
  entryPlace,
  isEditable,
  token,
  setRefetchEntry,
}) => {
  const [photos, setPhotos] = useState(entryPhotos);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photosInputRef = useRef(null);

  useEffect(() => {
    setPhotos(entryPhotos);
    setCurrentPhoto(entryPhotos.length - 1);
  }, [entryPhotos]);

  const prevPhoto = (e) => {
    e?.stopPropagation();

    setCurrentPhoto(currentPhoto === 0 ? photos.length - 1 : currentPhoto - 1);
  };

  const nextPhoto = (e) => {
    e?.stopPropagation();
    setCurrentPhoto(currentPhoto === photos.length - 1 ? 0 : currentPhoto + 1);
  };

  const deletePhoto = async () => {
    if (photos.length < 2) {
      toast.error("Debe quedar al menos una foto en la entrada");
      return;
    }

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/entries/${entryId}/photos/${photos[currentPhoto].id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      }
    );

    if (res.ok) {
      photos.splice(currentPhoto, 1);
      setPhotos([...photos]);
      prevPhoto();
      toast.success("Foto eliminada");
    } else {
      const error = await res.json();
      toast.error(error.message);
    }
  };

  const addPhoto = async (e) => {
    if (photos.length === 3) {
      toast.error("Una entrada no puede tener más de 3 fotos");
      return;
    }

    const payload = new FormData();

    payload.append("file1", e.target.files[0]);

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/entries/${entryId}/photos`,
      {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: payload,
      }
    );

    if (res.ok) {
      setRefetchEntry(true);
      toast.success("Foto subida");
    } else {
      const error = await res.json();
      toast.error(error.message);
    }
  };

  return (
    <div className="entry_photos_slider">
      <List
        className="photos_list"
        data={photos}
        render={(photo, index) => (
          <div
            key={photo.id}
            className={index === currentPhoto ? "slide active" : "slide"}
          >
            {index === currentPhoto && (
              <>
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${photo.photo}`}
                  alt={`Foto de ${entryPlace}`}
                  className="entry_photo"
                ></img>
                {photos.length > 1 && (
                  <>
                    <FontAwesomeIcon icon={faArrowLeft} onClick={prevPhoto} />
                    <FontAwesomeIcon icon={faArrowRight} onClick={nextPhoto} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      />
      {isEditable && (
        <>
          <label className="entry_files_add" htmlFor="entry_files_input">
            <FontAwesomeIcon icon={faPlusCircle} />
          </label>
          <input
            id="entry_files_input"
            name="entry_files_input"
            type="file"
            onChange={addPhoto}
            accept="image/*"
            ref={photosInputRef}
          />
          {photos.length > 0 && (
            <FontAwesomeIcon
              className="entry_files_delete"
              icon={faTrashAlt}
              onClick={deletePhoto}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PhotosSlider;
