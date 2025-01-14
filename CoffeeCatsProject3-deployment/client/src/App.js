import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import CustomerView from './CustomerView';
import EmployeeView from './EmployeeView';
import ManagerView from './ManagerView';
import DriveThruMenu from './MenuView';
import CashierView from './CashierView';
import WeatherStatus from './WeatherStatus';
import coffeeCatsLogo from './images/coffeeCatsLogo.png';
import { FiShoppingCart } from 'react-icons/fi';
import { FaTrash, FaPlus, FaMinus, FaBlackTie } from 'react-icons/fa';


const Dashboard = () => {
  const [view, setView] = useState('customer');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [passwordModal, setPasswordModal] = useState({ visible: false, view: '' });
  const [password, setPassword] = useState('');
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [oldTextSize, setOldTextSize] = useState(1);
  const googleTranslateRef = useRef(null);

  useEffect(() => {
    const loadGoogleTranslateScript = () => {
      if (!document.querySelector('#google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      if (googleTranslateRef.current) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages:
              'af,ach,ak,am,ar,az,be,bem,bg,bh,bn,br,bs,ca,chr,ckb,co,crs,cs,cy,da,de,ee,el,en,eo,es,es-419,et,eu,fa,fi,fo,fr,fy,ga,gaa,gd,gl,gn,gu,ha,haw,hi,hr,ht,hu,hy,ia,id,ig,is,it,iw,ja,jw,ka,kg,kk,km,kn,ko,kri,ku,ky,la,lg,ln,lo,loz,lt,lua,lv,mfe,mg,mi,mk,ml,mn,mo,mr,ms,mt,ne,nl,nn,no,nso,ny,nyn,oc,om,or,pa,pcm,pl,ps,pt-BR,pt-PT,qu,rm,rn,ro,ru,rw,sd,sh,si,sk,sl,sn,so,sq,sr,sr-ME,st,su,sv,sw,ta,te,tg,th,ti,tk,tl,tn,to,tr,tt,tum,tw,ug,uk,ur,uz,vi,wo,xh,yi,yo,zh-CN,zh-TW,zu',
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
          },
          googleTranslateRef.current
        );
      }
    };

    loadGoogleTranslateScript();
  }, []);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const toggleCart = () => {
    // Functionality to toggle cart visibility can be added if needed
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://coffeecatsproject3-0okd.onrender.com/auth-status', {
          withCredentials: true
        });
        setIsAuthenticated(response.data.isAuthenticated);
        setUserProfile(response.data.userProfile);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = 'https://coffeecatsproject3-0okd.onrender.com/login';
  };

  const handleLogout = () => {
    window.location.href = 'https://coffeecatsproject3-0okd.onrender.com/logout';
  };

  const handleViewChange = async (newView) => {
    setMessage('');
    if (!isAuthenticated) {
      setMessage('Please log in first');
      return;
    }
    if (newView === 'kitchen' || newView === 'cashier' || newView === 'manager') {
      setHighContrast(false);
      setTextSize(1);
    } 
    if (newView === 'customer' || newView === 'menu') {
      setView(newView);
      return;
    }
    setPasswordModal({ visible: true, view: newView });
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await axios.post(
        'https://coffeecatsproject3-0okd.onrender.com/api/validate-manager',
        { password },
        { withCredentials: true }
      );

      if (response.data.valid) {
        setView(passwordModal.view);
        setMessage(`Switched to ${passwordModal.view} view`);
      } else {
        setMessage('Invalid password');
      }
    } catch (error) {
      setMessage('Error validating password. Please try again.');
      console.error('Error:', error);
    } finally {
      setPassword('');
      setPasswordModal({ visible: false, view: '' });
    }
  };

  const toggleHighContrast = () => {
    if (highContrast) {
      setTextSize(oldTextSize);
    } else {
      setOldTextSize(textSize);
      if(textSize < 3){
        setTextSize(3);
      }
    }
    setHighContrast(!highContrast);
  };

  const getContrastStyle = () => {
    if (!highContrast) {
      return {
        background: {
          main: '#ffffff',
          sidebar: '#333',
          modal: '#ffffff',
        },
        text: {
          main: '#000000',
          sidebar: '#000000',
        },
        border: {
          main: '#000000',
        }
      };
    }
    return {
      background: {
        main: '#000000',
        sidebar: '#000000',
        modal: '#000000',
      },
      text: {
        main: '#ffffff',
        sidebar: '#ffffff',
      },
      border: {
        main: '#ffffff',
      }
    };
  };

  const contrastStyle = getContrastStyle();

  const increaseText = () => {
    setTextSize(textSize + 1);
    if(highContrast){
      setOldTextSize(textSize + 1);
    } else {
      setOldTextSize(oldTextSize + 1);
    }
  }

  const decreaseText = () => {
    setTextSize(textSize - 1);
    setOldTextSize(oldTextSize - 1)
  }

  const getTextSize = () => {
    if (textSize === 2) {
      return {
        text5: 'text-6xl',
        text4: 'text-5xl',
        text3: 'text-4xl',
        text2: 'text-3xl',
        textXL: 'text-2xl',
        textLG: 'text-xl',
        textBase: 'text-lg',
        textSM: 'text-base',
        textXS: 'text-sm',
      };
    } else if (textSize === 3) {
      return {
        text5: 'text-7xl',
        text4: 'text-6xl',
        text3: 'text-5xl',
        text2: 'text-4xl',
        textXL: 'text-3xl',
        textLG: 'text-2xl',
        textBase: 'text-xl',
        textSM: 'text-lg',
        textXS: 'text-base',
      };
    } else if (textSize === 4) {
      return {
        text5: 'text-8xl',
        text4: 'text-7xl',
        text3: 'text-6xl',
        text2: 'text-5xl',
        textXL: 'text-4xl',
        textLG: 'text-3xl',
        textBase: 'text-2xl',
        textSM: 'text-xl',
        textXS: 'text-lg',
      };
    } else if (textSize > 4) {
      decreaseText();
      return {
        text5: 'text-8xl',
        text4: 'text-7xl',
        text3: 'text-6xl',
        text2: 'text-5xl',
        textXL: 'text-4xl',
        textLG: 'text-3xl',
        textBase: 'text-2xl',
        textSM: 'text-xl',
        textXS: 'text-lg',
      };
    } else if (textSize < 1) {
      increaseText();
      return {
        text5: 'text-5xl',
        text4: 'text-4xl',
        text3: 'text-3xl',
        text2: 'text-2xl',
        textXL: 'text-xl',
        textLG: 'text-lg',
        textBase: 'text-base',
        textSM: 'text-sm',
        textXS: 'text-xs',
      };
    } else {
      return {
        text5: 'text-5xl',
        text4: 'text-4xl',
        text3: 'text-3xl',
        text2: 'text-2xl',
        textXL: 'text-xl',
        textLG: 'text-lg',
        textBase: 'text-base',
        textSM: 'text-sm',
        textXS: 'text-xs',
      };
    }
  };

  const sizeOfText = () => {
    if (textSize < 2) {
      return 'Smallest Size';
    } else if (textSize > 4) {
      return 'Largest Size';
    } else {
      return `Size ${textSize}`;
    }
  }

  const fontSize = getTextSize();

  // Helper function to determine if a view is active
  const isViewActive = (viewName) => view === viewName;
  const cartItemCount = cart.length;

  return (
    <div 
      className="p-6" 
      style={{ 
        backgroundColor: contrastStyle.background.main, 
      }}
    >      
      <div className={`flex justify-between items-center mb-6 ${fontSize.textBase}`}>
        <div className="flex items-center gap-4">
          <div className="hamburger-container"
            onClick={toggleNav}
            style={{color: contrastStyle.text.main}}>
            <div className={`hamburger ${isOpen ? 'open' : ''}`}>
            <div className={`line line1 ${
                highContrast
                  ? 'bg-white'
                  : 'bg-black'
              }`}></div>
              <div className={`line line2 ${
                highContrast
                  ? 'bg-white'
                  : 'bg-black'
              }`}></div>
              <div className={`line line3 ${
                highContrast
                  ? 'bg-white'
                  : 'bg-black'
              }`}></div>
            </div>
          </div>
          <img src={coffeeCatsLogo} width={75} alt="Coffee Cats Logo"/>
        </div>
        <h2 className={`${fontSize.textXL} font-bold text-center`}
        style={{color: contrastStyle.text.main}}>Coffee Cats - Pawsitively brewed purrfection!</h2>
        <div className='flex'>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <WeatherStatus/>
              {userProfile?.picture && (
                <img
                  src={userProfile.picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span style={{color: contrastStyle.text.main}}>{userProfile?.name}</span>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded border
                  ${
                    highContrast 
                    ? 'bg-black text-white border-white' 
                    : 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600'

                }`}
                style={{margin: 3}}
                >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className={`px-4 py-2 rounded border
                ${
                  highContrast 
                  ? 'bg-black text-white border-white' 
                  : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600'

              }`}
              style={{margin: 3, height: 42, alignSelf: 'center', alignContent: 'center'}}
              >
              Login
            </button>
          )}
          {isViewActive('customer') || isViewActive('menu') ? ( 
            <div>
              <button 
                onClick={toggleHighContrast}
                className={`px-4 py-2 rounded transition-colors border ${
                  highContrast 
                    ? 'bg-black text-white border-white' 
                    : 'bg-white text-black border-black'
                }`}
                style={{margin: 3}}
              >
                {highContrast ? 'Normal Mode' : 'High Contrast'}
              </button>
              <div>
                <button
                  onClick={increaseText}
                  className={`px-4 py-2 rounded transition-colors border ${
                    highContrast 
                      ? 'bg-black text-white border-white' 
                      : 'bg-white text-black border-black'
                  }`}
                  style={{margin: 3}}
                >
                  <FaPlus/>
                </button>
                <button
                  onClick={decreaseText}
                  className={`px-4 py-2 rounded transition-colors border ${
                    highContrast 
                      ? 'bg-black text-white border-white' 
                      : 'bg-white text-black border-black'
                  }`}
                  style={{margin: 3}}
                >
                  <FaMinus/>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Updated background-overlay element */}
      <div
        className={`background-overlay ${isOpen ? 'visible' : ''}`}
        onClick={isOpen ? toggleNav : null} // Only add click handler when overlay is visible
      />

      <nav className={`sidebar ${isOpen ? highContrast ? 'visible border border-white' : 'visible' : ''} `}
        style={{ 
          backgroundColor: contrastStyle.background.sidebar, 
          color: contrastStyle.text.sidebar 
        }}
      >
        <div className={`button-container flex flex-col gap-4 mt-4 ${fontSize.textBase}`}>
          <button
            onClick={() => handleViewChange('customer')}
            className={`px-4 py-2 rounded transition-colors border ${
              !highContrast
                ? isViewActive('customer')
                  ? 'bg-blue-500 text-white border-blue-500 hover:border-blue-700'
                  : 'bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-400 text-black'
                : isViewActive('customer')
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
            }`}
          >
            Customer View
          </button>
          <button
            onClick={() => handleViewChange('menu')}
            className={`px-4 py-2 rounded transition-colors border ${
              !highContrast
                ? isViewActive('menu')
                  ? 'bg-blue-500 text-white border-blue-500 hover:border-blue-700'
                  : 'bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-400 text-black'
                : isViewActive('menu')
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
            }`}
          >
            Menu View
          </button>
          <button
            onClick={() => handleViewChange('kitchen')}
            className={`px-4 py-2 rounded transition-colors border ${
              !highContrast
                ? isViewActive('kitchen')
                  ? 'bg-blue-500 text-white border-blue-500 hover:border-blue-700'
                  : 'bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-400 text-black'
                : isViewActive('kitchen')
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
            }`}
          >
            Kitchen View
          </button>
          <button
            onClick={() => handleViewChange('cashier')}
            className={`px-4 py-2 rounded transition-colors border ${
              !highContrast
                ? isViewActive('cashier')
                  ? 'bg-blue-500 text-white border-blue-500 hover:border-blue-700'
                  : 'bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-400 text-black'
                : isViewActive('cashier')
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
            }`}
          >
            Cashier View
          </button>
          <button
            onClick={() => handleViewChange('manager')}
            className={`px-4 py-2 rounded transition-colors border ${
              !highContrast
                ? isViewActive('manager')
                  ? 'bg-blue-500 text-white border-blue-500 hover:border-blue-700'
                  : 'bg-gray-100 border-gray-100 hover:border-gray-400 hover:bg-gray-400 text-black'
                : isViewActive('manager')
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
            }`}
          >
            Manager View
          </button>
          <div>
          <div ref={googleTranslateRef} id="google_translate_element"></div>
          </div>
        </div>
      </nav>

      {message && (
        <div
          className={`p-4 mb-4 rounded border ${
            highContrast
              ? 'bg-black text-white border-white'
              : message.includes('Invalid') ||
              message.includes('Error') ||
              message.includes('Please log in')
                ? 'bg-red-100 text-red-700 border-red-100'
                : 'bg-green-100 text-green-700 border-green-100'
          }`}
        >
          {message}
        </div>
      )}

      {passwordModal.visible && (
        <div className="fixed-modal flex items-center justify-center bg-black bg-opacity-50">
          <div 
            className="p-6 rounded shadow-md"
            style={{ 
              backgroundColor: contrastStyle.background.modal, 
              color: contrastStyle.text.main,
              borderColor: contrastStyle.border.main
            }}
          >
            <h3 className={`${fontSize.textLG} font-bold mb-4`}>
              Enter Password for {passwordModal.view} Access
            </h3>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
              className="w-full mb-4 p-2 border rounded text-black"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPasswordModal({ visible: false, view: '' })}
                className={`px-4 py-2 rounded border
                  ${
                    highContrast
                      ? 'bg-black text-white border-white'
                      : 'bg-gray-300 text-black'
                  }  
                `}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className={`text-white px-4 py-2 rounded border
                  ${
                    highContrast
                      ? 'bg-black border-white'
                      : 'bg-blue-500'
                  }
                `}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render the current view */}
      {view === 'customer' && <CustomerView cart={cart} setCart={setCart} highContrast={highContrast} textSize={textSize} />}
      {view === 'menu' && <DriveThruMenu highContrast={highContrast} textSize={textSize} />}
      {isAuthenticated && view === 'kitchen' && (
        <EmployeeView viewType="kitchen" />
      )}
      {isAuthenticated && view === 'cashier' && (
        <CashierView viewType="cashier" />
      )}
      {isAuthenticated && view === 'manager' && <ManagerView />}
    </div>
  );
};

export default Dashboard;
