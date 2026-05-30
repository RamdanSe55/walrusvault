module file_registry::registry {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::vector;
    use std::string::{Self, String};

    // ============ STRUCTS ============

    /// File metadata stored on-chain
    public struct FileMetadata has key, store {
        id: UID,
        file_hash: vector<u8>,
        walrus_blob_id: vector<u8>,
        file_name: String,
        file_size: u64,
        owner: address,
        created_at: u64,
        encrypted: bool,
        access_list: vector<address>,
    }

    /// Access control entry
    public struct AccessGrant has key, store {
        id: UID,
        file_id: address,
        grantee: address,
        access_level: u8, // 0=read, 1=write, 2=admin
        granted_at: u64,
        expires_at: u64, // 0 = never expires
    }

    // ============ EVENTS ============

    public struct FileRegistered has copy, drop {
        file_id: address,
        owner: address,
        file_name: String,
        file_size: u64,
        created_at: u64,
    }

    public struct FileTransferred has copy, drop {
        file_id: address,
        from: address,
        to: address,
        transferred_at: u64,
    }

    public struct AccessGranted has copy, drop {
        file_id: address,
        grantee: address,
        access_level: u8,
        granted_at: u64,
    }

    public struct AccessRevoked has copy, drop {
        file_id: address,
        grantee: address,
        revoked_at: u64,
    }

    // ============ FUNCTIONS ============

    /// Register new file on-chain
    public entry fun register_file(
        file_hash: vector<u8>,
        walrus_blob_id: vector<u8>,
        file_name: String,
        file_size: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);
        
        let metadata = FileMetadata {
            id: object::new(ctx),
            file_hash,
            walrus_blob_id,
            file_name: file_name,
            file_size,
            owner: sender,
            created_at: epoch,
            encrypted: true,
            access_list: vector::empty(),
        };

        let file_id = object::uid_to_address(&metadata.id);

        event::emit(FileRegistered {
            file_id,
            owner: sender,
            file_name,
            file_size,
            created_at: epoch,
        });

        transfer::transfer(metadata, sender);
    }

    /// Transfer file ownership (sharing)
    public entry fun transfer_file(
        metadata: FileMetadata,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);
        
        assert!(metadata.owner == sender, 1001); // Only owner can transfer

        let file_id = object::uid_to_address(&metadata.id);

        event::emit(FileTransferred {
            file_id,
            from: sender,
            to: recipient,
            transferred_at: epoch,
        });

        transfer::transfer(metadata, recipient);
    }

    /// Grant access to another wallet
    public entry fun grant_access(
        metadata: &mut FileMetadata,
        grantee: address,
        access_level: u8,
        expires_at: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);

        assert!(metadata.owner == sender, 1002); // Only owner can grant access
        assert!(access_level <= 2, 1003); // Valid access levels: 0, 1, 2

        let access_grant = AccessGrant {
            id: object::new(ctx),
            file_id: object::uid_to_address(&metadata.id),
            grantee,
            access_level,
            granted_at: epoch,
            expires_at,
        };

        // Add to access list
        if (!vector::contains(&metadata.access_list, &grantee)) {
            vector::push_back(&mut metadata.access_list, grantee);
        };

        let file_id = object::uid_to_address(&metadata.id);

        event::emit(AccessGranted {
            file_id,
            grantee,
            access_level,
            granted_at: epoch,
        });

        transfer::transfer(access_grant, sender);
    }

    /// Revoke access from wallet
    public entry fun revoke_access(
        metadata: &mut FileMetadata,
        grantee: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);

        assert!(metadata.owner == sender, 1004); // Only owner can revoke

        // Remove from access list
        let (found, index) = vector::index_of(&metadata.access_list, &grantee);
        if (found) {
            vector::remove(&mut metadata.access_list, index);
        };

        let file_id = object::uid_to_address(&metadata.id);

        event::emit(AccessRevoked {
            file_id,
            grantee,
            revoked_at: epoch,
        });
    }

    /// Check if address has access to file
    public fun has_access(
        metadata: &FileMetadata,
        address: address
    ): bool {
        metadata.owner == address || vector::contains(&metadata.access_list, &address)
    }

    /// Get file owner
    public fun get_owner(metadata: &FileMetadata): address {
        metadata.owner
    }

    /// Get file hash
    public fun get_file_hash(metadata: &FileMetadata): vector<u8> {
        metadata.file_hash
    }

    /// Get Walrus blob ID
    public fun get_walrus_blob_id(metadata: &FileMetadata): vector<u8> {
        metadata.walrus_blob_id
    }

    /// Get file size
    public fun get_file_size(metadata: &FileMetadata): u64 {
        metadata.file_size
    }

    /// Get creation timestamp
    public fun get_created_at(metadata: &FileMetadata): u64 {
        metadata.created_at
    }

    /// Get access list
    public fun get_access_list(metadata: &FileMetadata): vector<address> {
        metadata.access_list
    }
}
