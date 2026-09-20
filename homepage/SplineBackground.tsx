import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className="absolute top-0 inset-x-0 h-screen z-0 pointer-events-auto overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full md:w-[50vw] h-full animate-in fade-in duration-1000">
        <iframe 
          src="https://my.spline.design/loopingstaircaseportal-B6xkWAgFJOp4GpfcJWz4kOJl/" 
          frameBorder="0" 
          className="w-full h-full pointer-events-auto"
          title="Spline Looping Staircase Portal"
        ></iframe>
        {/* Hide Spline Logo */}
        <div className="absolute bottom-0 right-0 w-[200px] h-[80px] bg-black z-50"></div>
      </div>
      
      {/* Bottom fade to seamlessly blend with the content below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
