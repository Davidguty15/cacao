import React, { useState, useEffect } from "react";
import { auth, db, storage, handleFirestoreError, OperationType } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Product, ProductCategory, ProductSize } from "../types";
import { LogOut, UploadCloud, PlusCircle, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Shorts");
  const [sizeOptions, setSizeOptions] = useState<ProductSize[]>(["S", "M", "L"]);
  const [colorOptions, setColorOptions] = useState("Negro");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === "david.gutierrez906@asys.edu.co") {
          setIsAdmin(true);
        } else {
          // Check if user is admin
          try {
            const adminDoc = await getDoc(doc(db, "admins", u.uid));
            if (adminDoc.exists()) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
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

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure we prompt for account selection just in case
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleSize = (sz: ProductSize) => {
    setSizeOptions(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMsg("Debes subir una imagen.");
      return;
    }
    if (!name || !price || !description || sizeOptions.length === 0 || !colorOptions) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setUploading(true);
    setUploadMsg("Subiendo imagen...");
    setErrorMsg("");

    try {
      const productId = "product_" + Date.now().toString();
      
      // Upload image
      const storageRef = ref(storage, `products/${productId}_main`);
      const uploadTask = await uploadBytesResumable(storageRef, imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      setUploadMsg("Guardando el producto en base de datos...");
      
      const parsedColors = colorOptions.split(",").map(c => c.trim()).filter(Boolean);

      const newProduct = {
        id: productId,
        name,
        price: parseFloat(price),
        description,
        category,
        sizeOptions,
        colorOptions: parsedColors,
        mainImage: downloadURL,
        galleryImages: [],
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
      alert("¡Producto añadido con éxito!");
      
      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setColorOptions("Negro");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al subir el producto.");
      setUploadMsg("");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center uppercase font-black text-black tracking-widest text-xs">Cargando Sistema...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center shadow-lg border-4 border-black mt-10">
        <h2 className="text-xl font-black uppercase tracking-widest text-black mb-6">PANEL ADMINISTRATIVO CACAO</h2>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-8 font-bold">
          Ingresa con tu cuenta de Google designada como administrador para gestionar catálogo.
        </p>
        <button
          onClick={handleLogin}
          className="bg-black text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          INICIAR SESIÓN CON GOOGLE
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center border-4 border-black mt-10 relative">
        <button onClick={handleLogout} className="absolute top-4 right-4 flex items-center gap-2 text-xs font-black uppercase text-red-500 hover:text-red-700">
          <LogOut className="w-4 h-4" /> SALIR
        </button>
        <AlertCircle className="w-16 h-16 text-black mx-auto mb-4" />
        <h2 className="text-lg font-black uppercase tracking-widest text-black mb-4">ACCESO DENEGADO</h2>
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-4">
          La cuenta <b>{user.email}</b> no tiene privilegios de administrador.
        </p>
        <p className="text-[10px] bg-neutral-100 p-2 border border-black inline-block uppercase text-black font-mono">
          Tu UID: {user.uid}
        </p>
        <p className="text-[10px] text-neutral-400 mt-4 max-w-xs mx-auto">Para habilitar tu acceso, agrega un documento en la colección "admins" de tu base de datos de Firebase con este UID como nombre del documento.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest text-black">PANEL DE CONTROL</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black uppercase border-2 border-black px-4 py-2 hover:bg-neutral-100 transition-colors">
          <LogOut className="w-4 h-4" /> CERRAR SESIÓN
        </button>
      </div>

      <div className="bg-neutral-50 border-2 border-black p-6 sm:p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2"><PlusCircle /> AÑADIR NUEVO PRODUCTO</h2>
        
        {errorMsg && <div className="mb-6 bg-red-100 text-red-800 p-4 border-2 border-red-800 text-xs font-black uppercase flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
        {uploadMsg && <div className="mb-6 bg-blue-100 text-blue-800 p-4 border-2 border-blue-800 text-xs font-black uppercase flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {uploadMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">NOMBRE DEL PRODUCTO</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-amber-400 bg-white" placeholder="Ej. Camiseta Pro X" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">PRECIO (COP)</label>
              <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-amber-400 bg-white" placeholder="Ej. 120000" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">CATEGORÍA</label>
            <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className="w-full border-2 border-black p-3 text-sm font-bold uppercase focus:outline-none focus:border-amber-400 bg-white">
              <option value="Shorts">Shorts</option>
              <option value="Camisas">Camisas</option>
              <option value="Leggins">Leggings</option>
              <option value="Chaquetas">Chaquetas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">DESCRIPCIÓN</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:border-amber-400 bg-white" placeholder="Descripción detallada del producto..." />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">TALLAS DISPONIBLES</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`w-10 h-10 border-2 font-black text-xs uppercase transition-colors ${sizeOptions.includes(sz) ? "bg-black text-white border-black" : "bg-white text-neutral-400 border-neutral-300 hover:border-black"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">COLORES (Separados por coma)</label>
            <input required type="text" value={colorOptions} onChange={e => setColorOptions(e.target.value)} className="w-full border-2 border-black p-3 text-sm focus:outline-none focus:border-amber-400 bg-white" placeholder="Ej. Negro, Blanco, Gris" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">IMAGEN PRINCIPAL</label>
            <div className="border-4 border-dashed border-neutral-300 p-8 text-center bg-white hover:border-black transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              {imageFile ? (
                <span className="text-xs font-black uppercase text-black">{imageFile.name}</span>
              ) : (
                <span className="text-xs font-black uppercase text-neutral-400">Click para seleccionar imagen</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-black text-white font-black uppercase text-sm py-4 border-2 border-black hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {uploading ? "SUBIENDO..." : "CREAR PRODUCTO"}
          </button>
        </form>
      </div>
    </div>
  );
}
