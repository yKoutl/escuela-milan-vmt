import React from 'react';

export default function RippleBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#EC221F]">
      <div className="circle xxlarge shade1"></div>
      <div className="circle xlarge shade2"></div>
      <div className="circle large shade3"></div>
      <div className="circle medium shade4"></div>
      <div className="circle small shade5"></div>
      
      <style>{`
        .circle {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: ripple 15s infinite;
          box-shadow: 0px 0px 1px 0px #06020973;
        }

        .small {
          width: 200px;
          height: 200px;
          left: -100px;
          bottom: -100px;
        }

        .medium {
          width: 400px;
          height: 400px;
          left: -200px;
          bottom: -200px;
        }

        .large {
          width: 600px;
          height: 600px;
          left: -300px;
          bottom: -300px;
        }

        .xlarge {
          width: 800px;
          height: 800px;
          left: -400px;
          bottom: -400px;
        }

        .xxlarge {
          width: 1000px;
          height: 1000px;
          left: -500px;
          bottom: -500px;
        }

        .shade1 {
          opacity: 0.2;
        }
        .shade2 {
          opacity: 0.5;
        }
        .shade3 {
          opacity: 0.7;
        }
        .shade4 {
          opacity: 0.8;
        }
        .shade5 {
          opacity: 0.9;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
