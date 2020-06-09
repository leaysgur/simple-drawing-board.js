import { create } from ".";

const sdb = create(document.createElement("canvas"));

sdb.toDataURL();
sdb.toDataURL({ type: "image/png" });
sdb.toDataURL({ type: "image/png", quality: 0.4 });

sdb.fillImageByDataURL("xxxx");
sdb.fillImageByDataURL("xxxx", { isOverlay: true });
