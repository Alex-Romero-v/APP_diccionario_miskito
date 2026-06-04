package org.miskito.dictionary.data.repository

import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.data.local.relation.SearchResultProjection
import org.miskito.dictionary.domain.model.*

fun EntryEntity.toDomainModel() = DictionaryEntry(
    id = id,
    headword = headword,
    normalizedHeadword = normalizedHeadword,
    sortKey = sortKey,
    entryType = try { EntryType.valueOf(entryType) } catch (e: Exception) { EntryType.MAIN_ENTRY },
    parentEntryId = parentEntryId,
    partOfSpeech = partOfSpeech,
    rawPartOfSpeech = rawPartOfSpeech,
    sourcePage = sourcePage,
    rawText = rawText,
    verificationStatus = try { VerificationStatus.valueOf(verificationStatus) } catch (e: Exception) { VerificationStatus.VERIFIED },
    extractionConfidence = try { ExtractionConfidence.valueOf(extractionConfidence) } catch (e: Exception) { ExtractionConfidence.HIGH },
    hasExamples = hasExamples,
    hasNotes = hasNotes,
    hasVariants = hasVariants,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun TranslationEntity.toDomainModel() = Translation(
    id = id,
    entryId = entryId,
    spanishText = spanishText,
    englishText = englishText,
    translationOrder = translationOrder,
    isLiteral = isLiteral,
    note = note
)

fun VariantEntity.toDomainModel() = Variant(
    id = id,
    entryId = entryId,
    variantText = variantText,
    normalizedVariant = normalizedVariant,
    variantType = try { VariantType.valueOf(variantType) } catch (e: Exception) { VariantType.ALSO_SPELLED },
    note = note
)

fun ExampleEntity.toDomainModel() = Example(
    id = id,
    entryId = entryId,
    miskitoText = miskitoText,
    spanishText = spanishText,
    englishText = englishText,
    sourceCode = sourceCode,
    sourceDetail = sourceDetail,
    exampleOrder = exampleOrder,
    isLiteralTranslation = isLiteralTranslation
)

fun NoteEntity.toDomainModel() = DictionaryNote(
    id = id,
    entryId = entryId,
    noteType = try { NoteType.valueOf(noteType) } catch (e: Exception) { NoteType.GRAMMAR },
    noteText = noteText,
    noteOrder = noteOrder
)

fun EntryReferenceEntity.toDomainModel() = EntryReference(
    id = id,
    entryId = entryId,
    exampleId = exampleId,
    noteId = noteId,
    referenceCode = referenceCode,
    rawReferenceText = rawReferenceText
)

fun ReferenceEntity.toDomainModel() = DictionaryReference(
    code = code,
    shortName = shortName,
    fullDescription = fullDescription,
    language = language,
    referenceType = referenceType
)

fun SearchResultProjection.toDomainModel() = SearchResult(
    entryId = entryId,
    headword = headword,
    normalizedHeadword = normalizedHeadword,
    partOfSpeech = partOfSpeech,
    spanishTranslation = spanishTranslation,
    variantLabel = null,
    hasExamples = hasExamples,
    hasNotes = hasNotes
)

fun PhraseEntity.toDomainModel() = Phrase(
    id = id,
    phraseText = phraseText,
    normalizedPhrase = normalizedPhrase,
    spanishText = spanishText,
    englishText = englishText,
    category = try { PhraseCategory.valueOf(category) } catch (e: Exception) { PhraseCategory.GREETING },
    sourcePage = sourcePage,
    rawText = rawText
)

fun FavoriteEntity.toDomainModel() = FavoriteEntry(
    entryId = entryId,
    createdAt = createdAt
)

fun HistoryEntity.toDomainModel() = HistoryEntry(
    entryId = entryId,
    lastOpenedAt = lastOpenedAt,
    openCount = openCount
)

fun List<MetadataEntity>.toDomainModel(): DictionaryMetadata {
    val map = this.associate { it.key to it.value }
    return DictionaryMetadata(
        dictionaryName = map["dictionaryName"] ?: "Unknown",
        dictionarySource = map["dictionarySource"] ?: "Unknown",
        dictionaryDate = map["dictionaryDate"] ?: "Unknown",
        databaseVersion = map["databaseVersion"] ?: "1.0",
        buildDate = map["buildDate"] ?: "Unknown",
        entriesCount = map["entriesCount"] ?: "0",
        examplesCount = map["examplesCount"] ?: "0",
        appMinSupportedVersion = map["appMinSupportedVersion"] ?: "1.0"
    )
}
