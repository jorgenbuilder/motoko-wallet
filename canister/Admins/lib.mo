import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";

import Types "types";


module {

    public class Admins(state : Types.State) : Types.Interface {

        // Make sure that there is always at least one admin at initialization.
        assert(state.s_admins.size() != 0);


        ////////////
        // State //
        //////////


        private var admins : Buffer.Buffer<Principal> = Buffer.Buffer(0);

        for (admin in state.s_admins.vals()) {
            admins.add(admin);
        };

        public func backup () : [Principal] {
            admins.toArray();
        };


        //////////
        // API //
        ////////


        // Use this to add an admin-only restriction
        // ex: assert(_isAdmin(caller));
        public func _isAdmin(p : Principal) : Bool {
            for (a in admins.vals()) {
                if (a == p) { return true; };
            };
            false;
        };

        // Adds a new principal as an admin.
        public func addAdmin(caller : Principal, p : Principal) : () {
            assert(_isAdmin(caller));
            state._log(caller, "addAdmin", "ADMIN :: Adding admin " # Principal.toText(p));
            admins.add(p);
        };

        // Removes the given principal from the list of admins.
        public func removeAdmin(caller : Principal, p : Principal) : () {
            assert(_isAdmin(caller));
            state._log(caller, "removeAdmin", "ADMIN :: Removing admin " # Principal.toText(p));
            let newAdmins = Array.filter(
                admins.toArray(),
                func (a : Principal) : Bool {
                    a != p;
                },
            );
            admins.clear();
            for (admin in newAdmins.vals()) {
                admins.add(admin);
            };
        };

        // Check whether the given principal is an admin.
        public func isAdmin(caller : Principal, p : Principal) : Bool {
            for (a in admins.vals()) {
                if (a == p) return true;
            };
            return false;
        };

        public func getAdmins() : [Principal] {
            admins.toArray();
        };
    }
};