import { User } from "@/data/types/User"
import { buildConverterForType } from "../builders/buildConverterForType"
import { FirestoreDataConverter } from "@firebase/firestore"
import { PrivateUser } from "../types/PrivateUser"
import { PublicUser } from "../types/PublicUser"
import { SessionRecord } from "../types/SessionRecord"

import { EmailSendRecord } from "../types/EmailSendRecord"
import { Document } from "../types/Document"
import { DocumentEntry } from "../types/DocumentEntry"
import { VocabEntry } from "../types/VocabEntry"
import { RawParagraph } from "../types/RawParagraph"
import { DocumentJob } from "../types/DocumentJob"

export const CollectionsWithConverters: {
  [key in keyof CollectionModels]: FirestoreDataConverter<CollectionModels[key]>
} = {
  privateUser: buildConverterForType<PrivateUser>(),
  publicUser: buildConverterForType<PublicUser>(),
  document: buildConverterForType<Document>(),
  emailSendRecord: buildConverterForType<EmailSendRecord>(),
  dev_SessionRecord: buildConverterForType<SessionRecord>(),
  documentEntry: buildConverterForType<DocumentEntry>(),
  vocabEntry: buildConverterForType<VocabEntry>(),
  rawParagraph: buildConverterForType<RawParagraph>(),
  documentJob: buildConverterForType<DocumentJob>(),
}

export type AllModels = {
  privateUser: PrivateUser
  publicUser: PublicUser
  user: User
  document: Document
  dev_SessionRecord: SessionRecord
  emailSendRecord: EmailSendRecord
  vocabEntry: VocabEntry
  documentEntry: DocumentEntry
  rawParagraph: RawParagraph
  documentJob: DocumentJob
}

export type CollectionModels = Omit<AllModels, "user">
