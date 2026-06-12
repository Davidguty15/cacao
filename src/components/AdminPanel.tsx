import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Product, ProductCategory, ProductSize } from "../types";
import { LogOut, UploadCloud, PlusCircle, CheckCircle, AlertCircle, Mail, Lock, ShieldCheck, Edit, Trash2 } from "lucide-react";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);

  // Form states product
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Enterizos");
  const [sizeOptions, setSizeOptions] = useState<ProductSize[]>(["S", "M", "L"]);
  const [colorOptions, setColorOptions] = useState("Negro");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Auth states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "products"));
    const unsub = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        prods.push({
          id: data.id || doc.id,
          name: data.name,
          price: data.price,
          description: data.description,
          category: data.category,
          sizeOptions: data.sizeOptions || [],
          colorOptions: data.colorOptions || [],
          stock: data.stock || {},
          mainImage: data.mainImage,
          galleryImages: data.galleryImages || [],
          rating: data.rating || 5,
          reviewsCount: data.reviewsCount || 0,
          isNew: data.isNew ?? true,
          isFeatured: data.isFeatured ?? false,
          specifications: data.specifications || []
        });
      });
      setProducts(prods.sort((a,b) => b.id.localeCompare(a.id)));
    });
    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === "david.gutierrez906@asys.edu.co") {
          setIsAdmin(true);
        } else {
          try {
            if (u.email) {
              const adminDoc = await getDoc(doc(db, "admins", u.email));
              setIsAdmin(adminDoc.exists());
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (error: any) {
      console.error("Auth error:", error);
      let errMsg = "Error de autenticación.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errMsg = "Credenciales incorrectas.";
      } else if (error.code === 'auth/email-already-in-use') {
        errMsg = "El correo ya está registrado. Intenta iniciar sesión.";
      } else if (error.code === 'auth/weak-password') {
        errMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else {
        errMsg += " " + error.message;
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleSize = (sz: ProductSize) => {
    setSizeOptions(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setPrice(prod.price.toString());
    setDescription(prod.description);
    setCategory(prod.category);
    setSizeOptions(prod.sizeOptions);
    setColorOptions(prod.colorOptions.join(", "));
    setStock(prod.stock || {});
    setExistingImage(prod.mainImage || "");
    setExistingGalleryImages(prod.galleryImages || []);
    setImageFile(null);
    setGalleryFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás completamente seguro de que deseas eliminar este producto permanentemente?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        console.error("Error al eliminar", err);
        alert("Error al intentar eliminar el producto.");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setCategory("Enterizos");
    setSizeOptions(["S", "M", "L"]);
    setColorOptions("Negro");
    setStock({});
    setExistingImage("");
    setExistingGalleryImages([]);
    setImageFile(null);
    setGalleryFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !existingImage) {
      setErrorMsg("Debes subir una imagen principal.");
      return;
    }
    if (!name || !price || !description || sizeOptions.length === 0 || !colorOptions) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setUploading(true);
    setUploadMsg(editingId ? "Actualizando producto en la base de datos..." : "Ejecutando proceso de carga...");
    setErrorMsg("");

      try {
      let fileDataUrl = existingImage;

      if (imageFile) {
        fileDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 600;
              const MAX_HEIGHT = 600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round((width * MAX_HEIGHT) / height);
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject("Canvas no soportado");
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/webp", 0.6)); // Compress more
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      setUploadMsg("Estableciendo conexión segura con la base de datos...");
      
      let galleryDataUrls = [...existingGalleryImages];
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                  if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
                } else {
                  if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas no soportado");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/webp", 0.6));
              };
              img.onerror = reject;
              img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          galleryDataUrls.push(url);
        }
      }

      const parsedColors = colorOptions.split(",").map(c => c.trim()).filter(Boolean);

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          name,
          price: parseFloat(price),
          description,
          category,
          sizeOptions,
          colorOptions: parsedColors,
          stock,
          mainImage: fileDataUrl,
          galleryImages: galleryDataUrls
        });
        setUploadMsg("");
        setErrorMsg("");
        alert("¡PRODUCTO ACTUALIZADO CON ÉXITO!");
      } else {
        const productId = "product_" + Date.now().toString();
        const newProduct = {
          id: productId,
          name,
          price: parseFloat(price),
          description,
          category,
          sizeOptions,
          colorOptions: parsedColors,
          stock,
          mainImage: fileDataUrl,
          galleryImages: galleryDataUrls,
          rating: 5,
          reviewsCount: 0,
          isNew: true,
          isFeatured: false,
          specifications: [],
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "products", productId), newProduct);

        setUploadMsg("");
        setErrorMsg("");
        alert("¡RENDIMIENTO ÓPTIMO! Producto añadido con éxito al catálogo.");
      }
      
      resetForm();
    } catch (err: any) {
      console.error(err);
      
      let mensajeError = "Ocurrió un error al subir el producto.";
      if (err.message && err.message.includes("unauthorized")) {
        mensajeError = "No tienes permiso para subir imágenes. Activa Firebase Storage y configura las reglas públicas o para usuarios autenticados en tu consola de Firebase.";
      } else if (err.message) {
        mensajeError += " " + err.message;
      }

      setErrorMsg(mensajeError);
      setUploadMsg("");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center uppercase font-black text-black tracking-widest text-xs">Sincronizando Sistema de Administración...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 font-sans mt-10">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-center mb-6">
            <ShieldCheck className="w-12 h-12 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-center text-black mb-2">PORTAL DIRECTIVO CACAO</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold text-center mb-8">
            Autenticación cerrada y segura.
          </p>
          
          {authError && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 text-red-700 p-3 text-[11px] font-black uppercase flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2 flex items-center gap-1.5"><Mail className="w-3 h-3"/> CORREO ELECTRÓNICO</label>
              <input 
                type="email" 
                required 
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-amber-400 font-bold bg-neutral-50 focus:bg-white transition-colors" 
                placeholder="ejemplo@cacao.com" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2 flex items-center gap-1.5"><Lock className="w-3 h-3"/> CONTRASEÑA CLAVE</label>
              <input 
                type="password" 
                required 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-amber-400 font-bold bg-neutral-50 focus:bg-white transition-colors" 
                placeholder="••••••••" 
              />
            </div>
            
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-black text-white px-8 py-3.5 font-black text-xs uppercase tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {authLoading ? "PROCESANDO..." : "INGRESAR AL SISTEMA"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white border-4 border-black mt-10 relative">
        <button onClick={handleLogout} className="absolute top-4 right-4 flex items-center gap-2 text-xs font-black uppercase text-red-500 hover:text-red-700">
          <LogOut className="w-4 h-4" /> SALIR
        </button>
        <AlertCircle className="w-16 h-16 text-black mx-auto mb-4 stroke-[2]" />
        <h2 className="text-xl font-black uppercase tracking-widest text-black mb-2">ACCESO RESTRINGIDO</h2>
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-6">
          NIVEL DE SEGURIDAD INSUFICIENTE
        </p>
        <div className="bg-neutral-100 p-4 border-2 border-black text-left mb-6 relative">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-500">CORREO VINCULADO (DEBE SER EL ID DEL DOCUMENTO):</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-black break-all">{user.email}</p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user.email || "");
                alert("Correo copiado al portapapeles");
              }}
              className="ml-2 bg-black text-white text-[9px] px-2 py-1 font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shrink-0"
            >
              COPIAR
            </button>
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 max-w-xs mx-auto font-bold tracking-widest uppercase">
          La cuenta activa no se encuentra en el registro matriz.<br/><br/>
          Crea un documento en la colección "admins" de tu base de datos.<br/><br/>
          <span className="text-red-500 font-black">IMPORTANTE:</span> En el campo "ID del documento", PEGA tu correo electrónico. No dejes que Firebase genere este ID automáticamente. No necesitas agregar campos adicionales.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b-4 border-black pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">NÚCLEO DE INVENTARIO</h1>
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SISTEMA EN LÍNEA &mdash; {user.email}
          </p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black uppercase border-2 border-black bg-white px-5 py-2.5 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1">
          <LogOut className="w-4 h-4" /> CERRAR SISTEMA
        </button>
      </div>

      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        
        {/* Decorative structural elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-100 rounded-bl-full -z-10 mix-blend-multiply opacity-50"></div>
        
        <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center justify-between border-b-2 border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-6 h-6 text-black" /> 
            {editingId ? "EDICIÓN DE PRENDA" : "REGISTRO DE NUEVA PRENDA"}
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-neutral-200 text-black hover:bg-black hover:text-white transition-colors">
              CANCELAR EDICIÓN
            </button>
          )}
        </h2>
        
        {errorMsg && <div className="mb-8 bg-red-50 text-red-800 p-4 border-2 border-red-800 text-[11px] font-black uppercase flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {errorMsg}</div>}
        {uploadMsg && <div className="mb-8 bg-blue-50 text-blue-800 p-4 border-2 border-blue-800 text-[11px] font-black uppercase flex items-center gap-3"><CheckCircle className="w-5 h-5" /> {uploadMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">NOMBRE TÉCNICO DE LA PRENDA</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-black p-3.5 text-sm font-bold focus:outline-none focus:ring-0 focus:border-amber-400 bg-neutral-50 focus:bg-white transition-colors" placeholder="Ej. Camiseta Pro X" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">VALOR RETAIL (COP)</label>
              <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-2 border-black p-3.5 text-sm font-bold focus:outline-none focus:ring-0 focus:border-amber-400 bg-neutral-50 focus:bg-white transition-colors" placeholder="Ej. 120000" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">LÍNEA TEXTIL (CATEGORÍA)</label>
              <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className="w-full border-2 border-black p-3.5 text-sm font-black uppercase focus:outline-none focus:border-amber-400 bg-neutral-50 focus:bg-white transition-colors cursor-pointer appearance-none">
                <option value="Enterizos">01 — ENTERIZOS</option>
                <option value="Chaquetas">02 — CHAQUETAS</option>
                <option value="Shorts">03 — SHORTS</option>
                <option value="Leggins">04 — LEGGINS</option>
                <option value="Tops">05 — TOPS</option>
                <option value="Balacas">06 — BALACAS</option>
                <option value="Medias">07 — MEDIAS</option>
                <option value="Termos">08 — TERMOS</option>
                <option value="Camisas">09 — CAMISAS</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">ESPECTRO DE COLORES (Separados por coma)</label>
              <input required type="text" value={colorOptions} onChange={e => setColorOptions(e.target.value)} className="w-full border-2 border-black p-3.5 text-sm font-bold focus:outline-none focus:border-amber-400 bg-neutral-50 focus:bg-white transition-colors" placeholder="Ej. Negro, Blanco, Gris Tormenta" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">DESCRIPCIÓN DE INGENIERÍA Y DISEÑO</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border-2 border-black p-3.5 text-sm font-bold leading-relaxed focus:outline-none focus:border-amber-400 bg-neutral-50 focus:bg-white transition-colors" placeholder="Describe las propiedades de la tela, el tipo de ajuste y el uso recomendado para el alto rendimiento..." />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-3">MATRIZ DE TALLAJE DISPONIBLE</label>
            <div className="flex flex-wrap gap-3">
              {ALL_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`w-auto min-w-[3rem] px-3 h-12 border-2 font-black text-sm uppercase transition-all active:scale-95 ${sizeOptions.includes(sz) ? "bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]" : "bg-white text-neutral-400 border-neutral-300 hover:border-black hover:text-black"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {sizeOptions.length > 0 && colorOptions.trim() !== "" && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-3">INVENTARIO (CANTIDADES DISPONIBLES)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sizeOptions.map(sz => (
                  colorOptions.split(",").map(c => c.trim()).filter(Boolean).map(color => {
                    const key = `${sz}-${color}`;
                    return (
                      <div key={key} className="bg-neutral-50 border-2 border-black p-3 flex flex-col justify-between">
                        <label className="block text-[10px] font-black uppercase text-black mb-2 truncate" title={`${sz} - ${color}`}>{sz} - {color}</label>
                        <input 
                          type="number" 
                          min="0"
                          value={stock[key] === undefined ? "" : stock[key]}
                          onChange={e => setStock(prev => ({ ...prev, [key]: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 }))}
                          className="w-full border-2 border-black p-2 text-sm font-bold focus:outline-none focus:border-amber-400 bg-white"
                          placeholder="Ej. 10"
                        />
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">ACTIVO VISUAL PRINCIPAL</label>
            <div className={`border-4 border-dashed p-10 text-center transition-colors cursor-pointer relative ${imageFile || existingImage ? 'border-amber-400 bg-amber-50' : 'border-neutral-300 bg-neutral-50 hover:border-black hover:bg-neutral-100'}`}>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${imageFile || existingImage ? 'text-amber-500' : 'text-neutral-400'}`} />
              {imageFile ? (
                <>
                  <span className="text-xs font-black uppercase text-black block mb-1">ARCHIVO CAPTURADO (NUEVO):</span>
                  <span className="text-sm font-bold text-amber-600 block truncate px-4">{imageFile.name}</span>
                </>
              ) : existingImage ? (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black uppercase text-black block mb-2">IMAGEN ACTUAL MANTENIDA</span>
                  <img src={existingImage} alt="Preview" className="w-20 h-20 object-cover border-2 border-black" />
                  <span className="text-[10px] uppercase font-bold text-neutral-500 mt-2">Haz clic para reemplazarla</span>
                </div>
              ) : (
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">ARRASTRA O HAZ CLIC PARA SELECCIONAR LA IMAGEN</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">ACTIVOS VISUALES SECUNDARIOS (GALERÍA)</label>
            <div className={`border-4 border-dashed p-10 text-center transition-colors cursor-pointer relative ${(galleryFiles && galleryFiles.length > 0) ? 'border-amber-400 bg-amber-50' : 'border-neutral-300 bg-neutral-50 hover:border-black hover:bg-neutral-100'}`}>
              <input type="file" accept="image/*" multiple onChange={e => {
                if (e.target.files) {
                  setGalleryFiles(Array.from(e.target.files));
                }
              }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${(galleryFiles && galleryFiles.length > 0) ? 'text-amber-500' : 'text-neutral-400'}`} />
              {galleryFiles && galleryFiles.length > 0 ? (
                <>
                  <span className="text-xs font-black uppercase text-black block mb-1">{galleryFiles.length} ARCHIVO(S) CAPTURADO(S):</span>
                  <span className="text-sm font-bold text-amber-600 block truncate px-4">
                    {galleryFiles.map(f => f.name).join(", ")}
                  </span>
                </>
              ) : (
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">ARRASTRA O HAZ CLIC PARA AÑADIR MÁS IMÁGENES</span>
              )}
            </div>
            
            {existingGalleryImages && existingGalleryImages.length > 0 && (
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-black mb-2 block">IMÁGENES ACTUALES EN GALERÍA ({existingGalleryImages.length})</span>
                <div className="flex flex-wrap gap-2">
                  {existingGalleryImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Gallery ${idx}`} className="w-16 h-16 object-cover border-2 border-black" />
                      <button type="button" onClick={() => setExistingGalleryImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t-2 border-neutral-100">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-black text-white font-black uppercase tracking-widest text-sm py-5 border-4 border-black hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 active:translate-x-1"
            >
              {uploading ? "SINCRONIZANDO CON RED..." : (editingId ? "GUARDAR CAMBIOS DEL PRODUCTO" : "EJECUTAR CARGA DE PRODUCTO AL CATÁLOGO")}
            </button>
          </div>
        </form>
      </div>

      {/* Inventory List Section */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-12 overflow-hidden">
        <div className="p-6 sm:p-10 border-b-2 border-neutral-100 bg-neutral-50">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-black" /> 
            INVENTARIO ACTUAL ({products.length})
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-neutral-500 min-w-[200px]">Prenda</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Categoría</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Precio</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={prod.mainImage} alt={prod.name} className="w-10 h-10 object-cover border-2 border-neutral-200 bg-white" />
                      <div>
                        <p className="font-black text-xs uppercase text-black line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-neutral-500 uppercase">{prod.colorOptions.length} Color(es) • {prod.sizeOptions.join(", ")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-neutral-600 uppercase whitespace-nowrap">{prod.category}</td>
                  <td className="p-4 text-xs font-black whitespace-nowrap">${prod.price.toLocaleString("es-CO")}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(prod)} className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5" title="Editar">
                        <Edit className="w-4 h-4 text-black group-hover:text-white" />
                      </button>
                      <button onClick={() => handleDelete(prod.id)} className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5" title="Eliminar">
                        <Trash2 className="w-4 h-4 text-black group-hover:text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs font-bold uppercase text-neutral-400">
                    No hay prendas registradas en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

