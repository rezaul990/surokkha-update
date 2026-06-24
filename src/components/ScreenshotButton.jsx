import { useState } from 'react'
import './ScreenshotButton.css'

function ScreenshotButton({ targetRef, fileName = 'branch-report' }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        className="screenshot-button"
        onClick={() => setShowModal(true)}
        title="How to take perfect screenshot"
      >
        <span className="screenshot-icon">📸</span>
        <span>Take Screenshot</span>
      </button>

      {showModal && (
        <div className="screenshot-modal" onClick={() => setShowModal(false)}>
          <div className="screenshot-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>✕</button>
            <h2>📸 Perfect Screenshot Guide</h2>
            <div className="instructions">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Press Windows Shortcut</h3>
                  <p><kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></p>
                  <p className="step-detail">Screen will dim - this is the Snipping Tool</p>
                </div>
              </div>

              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Select Area</h3>
                  <p>Click and drag to select the report area</p>
                  <p className="step-detail">Include everything you want to capture</p>
                </div>
              </div>

              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Screenshot is Copied!</h3>
                  <p>Paste directly into WhatsApp with <kbd>Ctrl</kbd> + <kbd>V</kbd></p>
                  <p className="step-detail">Or click the notification to save as file</p>
                </div>
              </div>

              <div className="tip-box">
                <strong>💡 Pro Tip:</strong> Zoom out (Ctrl + Mouse Wheel) to fit more content on screen before taking screenshot!
              </div>
            </div>
            <button className="got-it-button" onClick={() => setShowModal(false)}>Got it! Let me try</button>
          </div>
        </div>
      )}
    </>
  )
}

export default ScreenshotButton
