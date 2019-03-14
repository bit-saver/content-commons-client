/**
 *
 * PageUpload
 *
 */
import React, { Component } from 'react';
import Link from 'next/link';
import {
  Button,
  Modal,
} from 'semantic-ui-react';
import imageIcon from 'static/icons/icon_150px_images_blue.png';
import docIcon from 'static/icons/icon_150px_document_blue.png';
import eduIcon from 'static/icons/icon_150px_edu_blue.png';
import videoIcon from 'static/icons/icon_150px_video_blue.png';
import audioIcon from 'static/icons/icon_150px_audio_blue.png';
import VideoUpload from './ContentModals/VideoUpload/VideoUpload';
import './Upload.scss';

class Upload extends Component {
  state = {
    modalOpen: false
  }

  handleModalOpen = () => {
    this.setState( { modalOpen: true } );
  }

  handleModalClose = () => {
    this.setState( { modalOpen: false } );
  }

  render() {
    const { modalOpen } = this.state;
    return (
      <div>
        <h1>Upload Content</h1>
        <section className="upload-content">
          <div className="contentTypes">
            <Button className="type disabled" aria-label="Upload Audio Content">
              <img src={ audioIcon } alt="Upload Audio Content" />
              <span>Audio</span>
            </Button>
            <Modal
              className="upload_modal"
              open={ modalOpen }
              trigger={ (
                <Button className="type" aria-label="Upload Video Content" onClick={ this.handleModalOpen }>
                  <img src={ videoIcon } alt="Upload video content" />
                  <span>Videos</span>
                </Button>
              ) }
              content={ <VideoUpload closeModal={ this.handleModalClose } /> }
            />
            <Button className="type disabled" aria-label="Upload Image Content">
              <img src={ imageIcon } alt="Upload images content" />
              <span>Images</span>
            </Button>
            <Button className="type disabled" aria-label="Upload Document Content">
              <img src={ docIcon } alt="Upload document content" />
              <span>Documents</span>
            </Button>
            <Button className="type disabled" aria-label="Upload Teaching Material Content">
              <img src={ eduIcon } alt="Upload teaching material content" />
              <span>Teaching Materials</span>
            </Button>
          </div>
        </section>

        <section className="upload_information">
          <div className="upload_information_advisory">
            <h3>Only upload files that:</h3>
            <ol>
              <li>You have the right to upload.</li>
              <li>Are allowed on the CDP servers.</li>
            </ol>
            <p>By uploading content you agree to our <Link href="/about"><a>Terms of Use</a></Link>.</p>
            <p>Read our <Link href="/about"><a>FAQs</a></Link> about uploading content.</p>
          </div>
          <div className="upload_information_bestResults">
            <h3>For best results:</h3>
            <p>We recommend naming files descriptively using keywords or languages, ex: "<i>project-tile_arabic.jpg</i>", to help pre-populate metadata fields and save you time when uplaoding content!</p>
          </div>
        </section>
      </div>
    );
  }
}

export default Upload;
