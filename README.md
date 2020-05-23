## Install

```
npm install well-team-client
```

## Configuration

Create a file config.json in your project directory.

```
{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
}

```

## Usage


### Help

```
npx well-team-client help
```

or if you run it from the project dir:

```
npm start -- help
```

### Book a new lesson

```
npx well-team-client book --lesson "cross training" --day tue --start-time 19:00 --end-time 20:00
```

or if you run it from the project dir:

```
npm start -- book --start-time 19:00 --end-time 20:00 --date 2020-05-25 --lesson "cross training"
```

### Cancel an already booked lesson

```
npx well-team-client cancel --lesson "sala pesi" --day tue --start-time 19:00 --end-time 20:00
```

or if you run it from the project dir:

```
npm start -- cancel --start-time 07:00 --end-time 08:00 --date 2020-05-25 --lesson "sala pesi"
```

### Retrieve lessons list for the current week


```
npx well-team-client lessons
```

or if you run it from the project dir:

```
npm start -- lessons
```