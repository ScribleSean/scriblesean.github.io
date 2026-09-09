"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./PhotosApp.module.css";

const photos = [
  { src: "/scene/interactive-scene.png", title: "A little world on my desk", note: "Interactive portfolio · project screenshot" },
  { src: "/scene/observatory-demo.png", title: "What I've been building", note: "Workspace Observatory · synthetic demo" },
  { src: "/scene/mobile-setup.webp", title: "The setup, up close", note: "Portfolio scene · rendered artwork" },
];

export default function PhotosApp() {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  function openPhoto(index: number) { setSelected(index); dialog.current?.showModal(); }
  return <section className={styles.photos} aria-label="Photos collage">
    <header><span>SEAN’S PHOTO BOX</span><p>Little things,<br /><em>kept around.</em></p><small>Project images for now. Personal photos coming later.</small></header>
    <div className={styles.collage}>
      <span className={styles.sticker} aria-hidden="true">a work<br />in progress ✳</span>
      {photos.map((photo, index) => <button className={styles.polaroid} type="button" key={photo.src} onClick={() => openPhoto(index)} aria-label={`Open ${photo.title}`}><Image src={photo.src} alt={photo.title} width={640} height={400} /><span>{photo.title}</span><small>{photo.note}</small></button>)}
      <div className={styles.note}><span>note to self</span><p>Make room for<br />the other stuff.</p><small>Photos, trips, and moments<br />to add to this collection.</small></div>
    </div>
    <footer>03 images <span>Click a print to take a closer look ↗</span></footer>
    <dialog ref={dialog} className={styles.viewer} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={event => { if (event.key === "ArrowRight") setSelected(value => (value + 1) % photos.length); if (event.key === "ArrowLeft") setSelected(value => (value + photos.length - 1) % photos.length); }}>
      <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close photo">×</button>
      <Image src={photos[selected].src} alt={photos[selected].title} width={1280} height={800} />
      <div className={styles.viewerControls}><button type="button" onClick={() => setSelected(value => (value + photos.length - 1) % photos.length)} aria-label="Previous photo">←</button><p>{photos[selected].title}<small>{photos[selected].note}</small></p><button type="button" onClick={() => setSelected(value => (value + 1) % photos.length)} aria-label="Next photo">→</button></div>
    </dialog>
  </section>;
}
