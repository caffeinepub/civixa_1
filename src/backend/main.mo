import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  public type Role = {
    #admin;
    #moderator : Text;
    #user;
  };

  public type ServiceStatus = {
    #operational;
    #warning;
    #interrupted;
  };

  public type User = {
    id : Principal;
    name : Text;
    email : Text;
    role : Role;
    mustChangePassword : Bool;
  };

  public type Location = {
    id : Text;
    name : Text;
    slug : Text;
  };

  public type Service = {
    id : Text;
    locationId : Text;
    name : Text;
    impact : Text;
    status : ServiceStatus;
  };

  public type Report = {
    id : Text;
    locationId : Text;
    serviceId : Text;
    area : Text;
    description : Text;
    contactEmail : Text;
    status : { #pending; #approved; #rejected };
    timestamp : Time.Time;
  };

  public type AuditLog = {
    action : Text;
    userId : Principal;
    locationId : Text;
    timestamp : Time.Time;
  };

  // Modules for comparison functions
  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.email, user2.email);
    };
  };

  module Location {
    public func compare(location1 : Location, location2 : Location) : Order.Order {
      Text.compare(location1.slug, location2.slug);
    };
  };

  module Service {
    public func compare(service1 : Service, service2 : Service) : Order.Order {
      Text.compare(service1.name, service2.name);
    };
  };

  module Report {
    public func compare(report1 : Report, report2 : Report) : Order.Order {
      Int.compare(report1.timestamp, report2.timestamp);
    };
  };

  module AuditLog {
    public func compare(log1 : AuditLog, log2 : AuditLog) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };
  };

  let users = Map.empty<Principal, User>();
  let locations = Map.empty<Text, Location>();
  let services = Map.empty<Text, Service>();
  let reports = Map.empty<Text, Report>();
  let auditLogs = List.empty<AuditLog>();

  public shared ({ caller }) func register(name : Text, email : Text) : async () {
    if (users.containsKey(caller)) {
      Runtime.trap("User already exists");
    };
    let newUser : User = {
      id = caller;
      name;
      email;
      role = #user;
      mustChangePassword = false;
    };
    users.add(caller, newUser);
  };

  public shared ({ caller }) func createLocation(name : Text) : async () {
    let id = name;
    let slug = name;
    let newLocation : Location = { id; name; slug };
    locations.add(id, newLocation);
  };

  public shared ({ caller }) func addService(locationId : Text, name : Text, impact : Text) : async () {
    let id = locationId # "_" # name;
    let newService : Service = {
      id;
      locationId;
      name;
      impact;
      status = #operational;
    };
    services.add(id, newService);
  };

  public shared ({ caller }) func submitReport(locationId : Text, serviceId : Text, area : Text, description : Text, contactEmail : Text) : async () {
    let id = caller.toText();
    let newReport : Report = {
      id;
      locationId;
      serviceId;
      area;
      description;
      contactEmail;
      status = #pending;
      timestamp = Time.now();
    };
    reports.add(id, newReport);
  };

  public shared ({ caller }) func approveReport(reportId : Text) : async () {
    let report = switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?r) { r };
    };
    let updatedReport = { report with status = #approved };
    reports.add(reportId, updatedReport);
    let log : AuditLog = {
      action = "approve";
      userId = caller;
      locationId = report.locationId;
      timestamp = Time.now();
    };
    auditLogs.add(log);
  };

  public shared ({ caller }) func rejectReport(reportId : Text) : async () {
    let report = switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report does not exist") };
      case (?r) { r };
    };
    let updatedReport = { report with status = #rejected };
    reports.add(reportId, updatedReport);
    let log : AuditLog = {
      action = "reject";
      userId = caller;
      locationId = report.locationId;
      timestamp = Time.now();
    };
    auditLogs.add(log);
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    users.values().toArray().sort();
  };

  public query ({ caller }) func getAllLocations() : async [Location] {
    locations.values().toArray().sort();
  };

  public query ({ caller }) func getServicesByLocation(locationId : Text) : async [Service] {
    services.values().filter(func(service) { service.locationId == locationId }).toArray().sort();
  };

  public query ({ caller }) func getPendingReports(locationId : Text) : async [Report] {
    reports.values().filter(func(report) { report.locationId == locationId and report.status == #pending }).toArray().sort();
  };

  public query ({ caller }) func getAuditLogs(locationId : Text) : async [AuditLog] {
    auditLogs.toArray().filter(func(log) { log.locationId == locationId }).sort();
  };
};
