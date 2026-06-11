import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ProductCategory, ProductSize } from "../types";
import { LogOut, UploadCloud, PlusCircle, CheckCircle, AlertCircle, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states product
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

  // Auth states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === "david.gutierrez906@asys.edu.co" || u.email === "david1515.org@gmail.com") {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, "admins", u.uid));
            setIsAdmin(adminDoc.exists());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMsg("Debes subir una imagen principal.");
      return;
    }
    if (!name || !price || !description || sizeOptions.length === 0 || !colorOptions) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setUploading(true);
    setUploadMsg("Subiendo imagen a alta velocidad...");
    setErrorMsg("");

    try {
      const productId = "product_" + Date.now().toString();
      
      const storageRef = ref(storage, `products/${productId}_main`);
      const uploadTask = await uploadBytesResumable(storageRef, imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      setUploadMsg("Estableciendo conexión segura con base de datos...");
      
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
      alert("¡RENDIMIENTO ÓPTIMO! Producto añadido con éxito al catálogo.");
      
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
          <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-neutral-500">IDENTIFICADOR DE OPERADOR:</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-black break-all">{user.uid}</p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user.uid);
                alert("UID copiado al portapapeles");
              }}
              className="ml-2 bg-black text-white text-[9px] px-2 py-1 font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors shrink-0"
            >
              COPIAR
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mt-3 mb-1 text-neutral-500">CORREO VINCULADO:</p>
          <p className="text-xs font-mono font-bold text-black">{user.email}</p>
        </div>
        <p className="text-[10px] text-neutral-500 max-w-xs mx-auto font-bold tracking-widest uppercase">
          La cuenta activa no se encuentra en el registro matriz de directivos.
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
        
        <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3 border-b-2 border-neutral-100 pb-4">
          <PlusCircle className="w-6 h-6 text-black" /> 
          REGISTRO DE NUEVA PRENDA
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
                <option value="Shorts">01 — SHORTS Y BERMUDAS</option>
                <option value="Camisas">02 — PLAYERAS TÉCNICAS</option>
                <option value="Leggins">03 — LEGGINGS COMPRESIÓN</option>
                <option value="Chaquetas">04 — OUTERS Y CHAQUETAS</option>
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
                  className={`w-12 h-12 border-2 font-black text-sm uppercase transition-all active:scale-95 ${sizeOptions.includes(sz) ? "bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]" : "bg-white text-neutral-400 border-neutral-300 hover:border-black hover:text-black"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-black mb-2">ACTIVO VISUAL PRINCIPAL</label>
            <div className={`border-4 border-dashed p-10 text-center transition-colors cursor-pointer relative ${imageFile ? 'border-amber-400 bg-amber-50' : 'border-neutral-300 bg-neutral-50 hover:border-black hover:bg-neutral-100'}`}>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${imageFile ? 'text-amber-500' : 'text-neutral-400'}`} />
              {imageFile ? (
                <>
                  <span className="text-xs font-black uppercase text-black block mb-1">ARCHIVO CAPTURADO:</span>
                  <span className="text-sm font-bold text-amber-600 block truncate px-4">{imageFile.name}</span>
                </>
              ) : (
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">ARRASTRA O HAZ CLIC PARA SELECCIONAR LA IMAGEN</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t-2 border-neutral-100">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-black text-white font-black uppercase tracking-widest text-sm py-5 border-4 border-black hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 active:translate-x-1"
            >
              {uploading ? "SINCRONIZANDO CON RED..." : "EJECUTAR CARGA DE PRODUCTO AL CATÁLOGO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

