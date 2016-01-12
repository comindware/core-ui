define(function() {
	'use strict';
	
    var usersArray = [
        {
            Abbreviation: "ad",
            AuthenticationMethod: "Builtin",
            CreationDate: "2015-10-22T12:18:31Z",
            Creator: "cmw.account.systemAccount",
            FullName: "admin",
            Id: "account.1",
            IsActive: true,
            IsSystemAdministrator: true,
            LastLoginDate: "2015-11-25T12:24:04Z",
            LastWriteDate: "2015-10-22T12:18:31Z",
            Mbox: "ad@m.in",
            PresentedOnOrgChart: false,
            Role: "Administrator",
            TaskContainer: "account.1_tasks",
            Text: "admin",
            Username: "admin",
            Value: "account.1",
            abbreviation: "ad",
            licensed: undefined,
            link: "#People/Users/account.1",
            userpicLargeUri: undefined,
            userpicUri: undefined
        },
        {
            Abbreviation: "ad",
            AuthenticationMethod: "Builtin",
            CreationDate: "2015-10-22T12:18:31Z",
            Creator: "cmw.account.systemAccount",
            FullName: "admin2",
            Id: "account.2",
            IsActive: true,
            IsSystemAdministrator: true,
            LastLoginDate: "2015-11-25T12:24:04Z",
            LastWriteDate: "2015-10-22T12:18:31Z",
            Mbox: "ad2@m.in",
            PresentedOnOrgChart: false,
            Role: "Administrator",
            TaskContainer: "account.2_tasks",
            Text: "admin2",
            Username: "admin2",
            Value: "account.2",
            abbreviation: "ad",
            licensed: undefined,
            link: "#People/Users/account.2",
            userpicLargeUri: undefined,
            userpicUri: undefined
        },
        {
            Abbreviation: "ad",
            AuthenticationMethod: "Builtin",
            CreationDate: "2015-10-22T12:18:31Z",
            Creator: "cmw.account.systemAccount",
            FullName: "admin3",
            Id: "account.3",
            IsActive: true,
            IsSystemAdministrator: true,
            LastLoginDate: "2015-11-25T12:24:04Z",
            LastWriteDate: "2015-10-22T12:18:31Z",
            Mbox: "ad3@m.in",
            PresentedOnOrgChart: false,
            Role: "Administrator",
            TaskContainer: "account.3_tasks",
            Text: "admin3",
            Username: "admin3",
            Value: "account.3",
            abbreviation: "ad",
            licensed: undefined,
            link: "#People/Users/account.3",
            userpicLargeUri: undefined,
            userpicUri: undefined
        },
        {
            Abbreviation: "ad",
            AuthenticationMethod: "Builtin",
            CreationDate: "2015-10-22T12:18:31Z",
            Creator: "cmw.account.systemAccount",
            FullName: "admin4",
            Id: "account.4",
            IsActive: true,
            IsSystemAdministrator: true,
            LastLoginDate: "2015-11-25T12:24:04Z",
            LastWriteDate: "2015-10-22T12:18:31Z",
            Mbox: "ad4@m.in",
            PresentedOnOrgChart: false,
            Role: "Administrator",
            TaskContainer: "account.4_tasks",
            Text: "admin4",
            Username: "admin4",
            Value: "account.4",
            abbreviation: "ad",
            licensed: undefined,
            link: "#People/Users/account.4",
            userpicLargeUri: undefined,
            userpicUri: undefined
        }
    ];

    return {
        GetUsers: function() {
            return usersArray;
        },
        ListUsers: function() {
            return usersArray;
        }
    };
});