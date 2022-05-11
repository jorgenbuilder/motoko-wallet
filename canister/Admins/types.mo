module Admins {

    public type StableState = {
        s_admins  : [Principal];
    };

    public type Dependencies = {
        _log : (caller  : Principal, method  : Text, message : Text) -> ();
    };

    public type State = StableState and Dependencies;

    public type Interface = {
        // Use this to add an admin-only restriction.
        // @modifier
        _isAdmin : (p : Principal) -> Bool;

        /// Adds a new principal as an admin.
        addAdmin : (caller : Principal, p : Principal) -> ();

        /// Removes the given principal from the list of admins.
        removeAdmin : (caller : Principal, p : Principal) -> ();
        
        // Checks whether the given principal is an admin.
        isAdmin : (caller : Principal, p : Principal) -> Bool;
    };

};