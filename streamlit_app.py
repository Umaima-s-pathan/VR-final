import streamlit as st
import requests
import time
from datetime import datetime

# Configure the page
st.set_page_config(
    page_title="Palace VR180 Platform",
    page_icon="🏰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Backend URL - Update this with your deployed backend
BACKEND_URL = "https://vr-final.onrender.com"

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f2937;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #6b7280;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        margin: 1rem 0;
        text-align: center;
    }
    .launch-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        margin: 1rem;
        text-decoration: none;
        display: inline-block;
    }
    .launch-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .status-indicator {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
    }
    .status-online {
        background-color: #10b981;
        color: white;
    }
    .status-offline {
        background-color: #ef4444;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

def check_backend_status():
    """Check if the backend service is running"""
    try:
        backend_url = st.session_state.get('backend_url', 'https://vr-final.onrender.com')

        # First try the health endpoint
        try:
            response = requests.get(f"{backend_url}/api/health", timeout=10)
            if response.status_code == 200:
                return True
        except:
            pass

        # Fallback to root endpoint
        response = requests.get(f"{backend_url}/", timeout=10)
        return response.status_code == 200
    except:
        return False

def main():
    # Header
    st.markdown('<div class="main-header">🏰 Palace VR180 Platform</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Transform 2D Videos into Immersive VR180 Experiences</div>', unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.header("🚀 Quick Launch")

        # Backend URL configuration
        st.subheader("Backend Configuration")
        backend_url = st.text_input(
            "Backend URL",
            value=st.session_state.get('backend_url', 'https://vr-final.onrender.com'),
            help="Enter your deployed backend URL"
        )
        st.session_state.backend_url = backend_url

        # Status check
        if st.button("Check Backend Status", type="secondary"):
            with st.spinner("Checking backend status..."):
                time.sleep(1)
                is_online = check_backend_status()
                if is_online:
                    st.success("✅ Backend is online!")
                else:
                    st.error("❌ Backend is offline or unreachable")

        st.divider()

        # Quick actions
        st.subheader("Quick Actions")
        if st.button("🎬 Launch VR180 Platform", type="primary", use_container_width=True):
            st.session_state.show_launch = True

        if st.button("📊 System Status", use_container_width=True):
            st.session_state.show_status = True

    # Main content
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        <div class="feature-card">
            <h3>🎥 AI-Powered Conversion</h3>
            <p>Transform any 2D video into immersive VR180 experiences using cutting-edge AI technology</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="feature-card">
            <h3>⚡ 5-Stage Pipeline</h3>
            <p>Advanced processing pipeline with depth estimation, stereo synthesis, and AI enhancement</p>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="feature-card">
            <h3>📱 Cross-Platform</h3>
            <p>Works seamlessly on desktop, mobile, and VR headsets with WebXR support</p>
        </div>
        """, unsafe_allow_html=True)

    # Launch section
    st.header("🚀 Launch Application")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Frontend Application")
        st.write("Access the main VR180 conversion interface")

        if st.button("🌐 Open Frontend", type="primary", use_container_width=True):
            st.markdown("""
            <a href="https://Umaima-s-pathan.github.io/VR-final/" target="_blank">
                <button class="launch-button">🌐 Launch Frontend</button>
            </a>
            """, unsafe_allow_html=True)

        st.info("📝 **Note**: Frontend is deployed and ready to use!")

    with col2:
        st.subheader("Backend API")
        st.write("Access the processing backend and API documentation")

        if st.button("🔧 Open Backend", type="secondary", use_container_width=True):
            st.markdown(f"""
            <a href="{backend_url}" target="_blank">
                <button class="launch-button">🔧 Launch Backend</button>
            </a>
            """, unsafe_allow_html=True)

    # Features overview
    st.header("✨ Key Features")

    features_col1, features_col2 = st.columns(2)

    with features_col1:
        st.markdown("""
        **Processing Pipeline:**
        - 🎯 Depth Map Generation (MiDaS AI)
        - 👁️ Stereo Synthesis (DIBR)
        - 🎨 AI Outpainting & Projection
        - 👀 Foveated Edge Blur
        - ⚡ AI Upscaling (4K+ resolution)
        """)

    with features_col2:
        st.markdown("""
        **User Experience:**
        - 📁 Drag & Drop Upload
        - 📊 Real-time Progress Tracking
        - 🎮 VR Preview & Download
        - 📱 Responsive Design
        - 🔄 Batch Processing Support
        """)

    # Video Upload Section
    st.header("🎥 Upload & Convert Video")

    st.markdown("**Upload your video directly here for immediate VR180 conversion!**")

    # File uploader
    uploaded_file = st.file_uploader(
        "Choose a video file",
        type=["mp4", "mov", "avi"],
        help="Upload a video file (MP4, MOV, AVI) - Max 500MB"
    )

    if uploaded_file is not None:
        # Show file details
        st.success(f"✅ File uploaded: {uploaded_file.name}")
        st.info(f"📊 File size: {uploaded_file.size / (1024*1024):.2f} MB")

        # Upload button
        if st.button("🚀 Start VR180 Conversion", type="primary", use_container_width=True):
            with st.spinner("Uploading and processing video..."):
                try:
                    # Create form data
                    files = {"video": uploaded_file}
                    data = {"filename": uploaded_file.name}

                    # Upload to backend with longer timeout and retry logic
                    max_retries = 3
                    retry_delay = 5

                    for attempt in range(max_retries):
                        try:
                            st.info(f"📤 Upload attempt {attempt + 1}/{max_retries}...")

                            # First, wake up the backend with a simple request
                            try:
                                requests.get(f"{BACKEND_URL}/", timeout=10)
                                st.info("✅ Backend is awake and ready!")
                            except:
                                st.warning("⚠️ Backend might be sleeping, waking it up...")

                            # Now try the upload
                            response = requests.post(
                                f"{BACKEND_URL}/api/upload",
                                files=files,
                                data=data,
                                timeout=300  # Increased timeout to 5 minutes for large files
                            )
                            break  # Success, exit retry loop
                        except requests.exceptions.Timeout:
                            if attempt < max_retries - 1:
                                st.warning(f"⏰ Upload timed out. Retrying in {retry_delay} seconds...")
                                time.sleep(retry_delay)
                                continue
                            else:
                                raise  # Re-raise the last timeout error
                        except requests.exceptions.ConnectionError:
                            if attempt < max_retries - 1:
                                st.warning(f"🔌 Connection failed. Retrying in {retry_delay} seconds...")
                                time.sleep(retry_delay)
                                continue
                            else:
                                raise  # Re-raise the last connection error


                    if response.status_code == 200:
                        result = response.json()
                        st.success("✅ Upload successful!")
                        st.balloons()

                        # Show processing info
                        st.info(f"🔄 **Job ID**: {result.get('jobId', 'N/A')}")
                        st.info("📊 **Status**: Processing started - this may take 15-45 minutes")

                        # Show next steps
                        st.markdown("### 🎯 Next Steps:")
                        st.markdown("1. **Wait for processing** to complete")
                        st.markdown("2. **Check status** using the Job ID above")
                        st.markdown("3. **Download** your VR180 video when ready")

                        # Show processing stages
                        st.markdown("### ⚡ Processing Pipeline:")
                        stages = [
                            "🎯 Depth Map Generation (MiDaS AI)",
                            "👁️ Stereo Synthesis (DIBR)",
                            "🎨 AI Outpainting & Projection",
                            "👀 Foveated Edge Blur",
                            "⚡ AI Upscaling (4K+ Enhancement)"
                        ]

                        for stage in stages:
                            st.markdown(f"- {stage}")

                    else:
                        st.error(f"❌ Upload failed: {response.text}")

                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
                    st.error("💡 **Tip**: Make sure your backend is running and accessible")

    # Getting started guide
    st.header("📋 Getting Started")

    with st.expander("🚀 Deployment Instructions"):
        st.markdown("""
        **1. Deploy Frontend to GitHub Pages:**
        ```bash
        # Push your code to GitHub
        git add .
        git commit -m "Deploy to GitHub Pages"
        git push origin main
        ```

        **2. Deploy Backend (choose one):**
        - **Railway**: Connect your GitHub repo and deploy
        - **Render**: Connect your GitHub repo and deploy
        - **Heroku**: Use Heroku CLI to deploy

        **3. Update URLs:**
        - Update the GitHub Pages URL in this Streamlit app
        - Update the backend URL in your frontend configuration

        **4. Access Your App:**
        - Use this Streamlit app as your launcher
        - Or access directly via GitHub Pages URL
        """)

    # Footer
    st.divider()
    st.markdown("""
    <div style="text-align: center; color: #6b7280; margin-top: 2rem;">
        <p>🏰 Palace VR180 Platform - Transform your videos into immersive experiences</p>
        <p>Built with ❤️ using React, Node.js, and Streamlit</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
