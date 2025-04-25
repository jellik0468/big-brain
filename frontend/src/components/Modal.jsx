function Modal({ open, onClose, children }) {
  return (
    <div onClick={onClose} className={`
      fixed inset-0 flex justify-center items-center transition-colors backdrop-blur-sm overflow-y-auto
      ${open ? "visible bg-black/20" : "invisible"}
    `}>

      {/*modal*/}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
        bg-white rounded-xl shadow p-6 transition-all max-h-[80vh] overflow-y-auto p-10
        ${open ? "scale-100 opcity-100" : "scale-125 opacity-0"}
        `}>

        <button onClick={onClose}
          className="absolute top-2  right-2  p-1 rounded-lg
          text-gray-400 bg-white hover:bg-gray-50
          hover:text-gray-600">
            Close
        </button>

        {children}
        
      </div>
    </div>
  )
}

export default Modal