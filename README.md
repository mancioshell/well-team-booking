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

book a new lesson

```
npx well-team-client --action book --lesson "cross training" --day tue --start-time 19:00 --end-time 20:00
```

cancel a booked lesson

```
npx well-team-client --action cancel --lesson "cross training" --day tue --start-time 19:00 --end-time 20:00
```