function AuthLayout({ children }) {
  return (
    <div className="body">
      <div className="left">
        {children}
      </div>

      <div className="right">
        <div className="mainImage"></div>
      </div>
    </div>
  );
}

export default AuthLayout;