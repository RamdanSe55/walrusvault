// WalrusVault File Registry Smart Contract
// Stores file metadata on SUI blockchain

module walrusvault::file_registry {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use sui::event;

    // Error codes
    const ENotOwner: u64 = 1;
    const EFileNotFound: u64 = 2;
    const EInvalidHash: u64 = 3;

    // File metadata struct
    struct FileMetadata has key, store {
        id: UID,
        owner: address,
        file_name: String,
        file_hash: String,
        walrus_blob_id: String,
        file_size: u64,
        encrypted: bool,
        created_at: u64,
        access_count: u64,
    }

    // Registry to store all files
    struct FileRegistry has key {
        id: UID,
        files: Table<String, address>, // file_hash -> FileMetadata object ID
        total_files: u64,
    }

    // Events
    struct FileUploaded has copy, drop {
        file_hash: String,
        owner: address,
        walrus_blob_id: String,
        timestamp: u64,
    }

    struct FileAccessed has copy, drop {
        file_hash: String,
        accessor: address,
        timestamp: u64,
    }

    struct FileDeleted has copy, drop {
        file_hash: String,
        owner: address,
        timestamp: u64,
    }

    // Initialize registry (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let registry = FileRegistry {
            id: object::new(ctx),
            files: table::new(ctx),
            total_files: 0,
        };
        transfer::share_object(registry);
    }

    // Upload file metadata to blockchain
    public entry fun upload_file(
        registry: &mut FileRegistry,
        file_name: vector<u8>,
        file_hash: vector<u8>,
        walrus_blob_id: vector<u8>,
        file_size: u64,
        encrypted: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let file_metadata = FileMetadata {
            id: object::new(ctx),
            owner: sender,
            file_name: string::utf8(file_name),
            file_hash: string::utf8(file_hash),
            walrus_blob_id: string::utf8(walrus_blob_id),
            file_size,
            encrypted,
            created_at: timestamp,
            access_count: 0,
        };

        let file_hash_str = string::utf8(file_hash);
        let file_addr = object::uid_to_address(&file_metadata.id);
        
        table::add(&mut registry.files, file_hash_str, file_addr);
        registry.total_files = registry.total_files + 1;

        event::emit(FileUploaded {
            file_hash: file_hash_str,
            owner: sender,
            walrus_blob_id: string::utf8(walrus_blob_id),
            timestamp,
        });

        transfer::transfer(file_metadata, sender);
    }

    // Access file (increment access count)
    public entry fun access_file(
        file: &mut FileMetadata,
        ctx: &mut TxContext
    ) {
        let accessor = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        file.access_count = file.access_count + 1;

        event::emit(FileAccessed {
            file_hash: file.file_hash,
            accessor,
            timestamp,
        });
    }

    // Delete file metadata (only owner)
    public entry fun delete_file(
        registry: &mut FileRegistry,
        file: FileMetadata,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(file.owner == sender, ENotOwner);

        let timestamp = tx_context::epoch(ctx);
        let file_hash = file.file_hash;

        table::remove(&mut registry.files, file_hash);
        registry.total_files = registry.total_files - 1;

        event::emit(FileDeleted {
            file_hash,
            owner: sender,
            timestamp,
        });

        let FileMetadata { 
            id, 
            owner: _, 
            file_name: _, 
            file_hash: _, 
            walrus_blob_id: _, 
            file_size: _, 
            encrypted: _, 
            created_at: _, 
            access_count: _ 
        } = file;
        object::delete(id);
    }

    // View functions
    public fun get_file_owner(file: &FileMetadata): address {
        file.owner
    }

    public fun get_file_hash(file: &FileMetadata): String {
        file.file_hash
    }

    public fun get_walrus_blob_id(file: &FileMetadata): String {
        file.walrus_blob_id
    }

    public fun get_file_size(file: &FileMetadata): u64 {
        file.file_size
    }

    public fun get_access_count(file: &FileMetadata): u64 {
        file.access_count
    }

    public fun is_encrypted(file: &FileMetadata): bool {
        file.encrypted
    }

    public fun get_total_files(registry: &FileRegistry): u64 {
        registry.total_files
    }
}
