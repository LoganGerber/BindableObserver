# EventObserver

EventObserver is an implementation of an [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) written for Typescript and Javascript.

The EventObserver class is a lot like Node.JS's built-in [EventEmitter](https://nodejs.org/api/events.html) class, to the point that it has all the same function names. However, **EventObserver is not an EventEmitter**. It cannot be used in places expecting an EventEmitter. You cannot swap out your EventEmitter for an EventObserver. They are not swappable for one another in this way.

The reason for this is because where EventEmitters expect strings or symbols as their events, the EventObserver expects an instance of an Event object.

EventObservers expect Event objects because of the way they differ from EventEmitters: They have the ability to relay their Events to other EventObservers! Binding two EventObservers can result in a couple different things, depending on the settings supplied. 
1) One EventObserver can relay all its emitted events to a different EventObserver (direction specified by user),
2) Both EventObservers can relay all their emitted to events to one another, or
3) Neither EventObserver can relay any of their events to one another.
The last one is pointless, but I included it for completeness sake.

### Why relay Events between observers?
Going into this project, I had a specific use case in mind. I want the ability to create an event-driven program that can communicate its events to another program (probably via a websocket/named pipe/some other method of communication), but I don't want ALL my events being sent over to the other program.

EventObserver is my answer to this problem. This way, there can exist two seperate Observers, with only one of them sending its events out to the other program. But now, the user only needs to manage their listeners a single Observer, depending on if the events are broadcasted outward or not.

### Why not use the built-in EventEmitter?

Firstly, EventEmitter does not have the ability to relay events to another EventEmitter instance. To add this feature, there are a few pitfalls that need to be kept in mind. For example, you need to ensure events aren't passed back and forth between two EventEmitters forever, causing your program to hang. This is all dealt with internally in EventObserver.

Second, I'm not a fan of how EventEmitters promote using listeners that take a different number of parameters, based on what data you want to pass for which events. I wanted all my data to be encapsulated in a single object, and for that to be (more or less) enforced. You could call it a silent protest if you'd like.

### Why not use Socket.io/my other favorite implementation of the Observer pattern?

Socket.io has the same issues I mentioned above.

As for any other Observer implementation, I decided to stop searching for other options because, in the end, I felt like this would be a fun project to learn Javascript and Typescript. And it was! It was also a great excuse to finally learn the basics of code testing.


## Future plans:
* Ability to bind asyncronous listeners to events
* Ability to asyncronously call all listeners when emitting an event.
* Various code updates as I learn more about Typescript best practices and unit testing best practices.
