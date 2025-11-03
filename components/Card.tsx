import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import QRCodeShare from "@/components/QRCodeShare";
import { FavoriteButton } from "@/components/FavoriteButton";

const Card = ({ file }: { file: Models.Document }) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <FavoriteButton id={file.$id} />
            <ActionDropdown file={file} />
          </div>
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200 flex items-center gap-2">
          By: {file.owner.fullName}
          <QRCodeShare fileUrl={file.url} fileName={file.name} />
        </p>
      </div>
    </Link>
  );
};

export default Card;
