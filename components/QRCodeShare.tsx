"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLinkIcon, EyeIcon } from "lucide-react";

interface QRCodeShareProps {
  fileUrl: string;
  fileName: string;
}

const QRCodeShare = ({ fileUrl, fileName }: QRCodeShareProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePreview = () => {
    // Open in a new window but with a preview mode
    window.open(`/preview?url=${encodeURIComponent(fileUrl)}`, '_blank');
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link component from navigating
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="share-button"
      >
        QR
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="qr-dialog">
          <DialogTitle className="qr-title">
            {fileName}
          </DialogTitle>
          
          <div className="flex flex-col items-center gap-6">
            <div className="qr-code">
              <QRCodeSVG
                value={fileUrl}
                size={200}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/assets/icons/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <p className="qr-description">
              Scan the QR code to access the file or use the buttons below
            </p>

            <div className="flex gap-4">
              <Button 
                onClick={handlePreview}
                className="qr-action-button"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Preview File
              </Button>
              
              <Button 
                onClick={() => window.open(fileUrl, '_blank')}
                className="qr-action-button"
              >
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                Open File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeShare; 