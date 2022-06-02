module Route exposing (Route(..), name, parser)

import Url exposing (Url)
import Url.Parser as Parser exposing (Parser, (</>), (<?>), int, map, oneOf, s, string)
import Url.Parser.Query as ParserQ


-- MODEL


type Route
    = Home
    | Login
    | Profile (Maybe String)
    | Download (Maybe String)
    | NotFound Url


parser : Parser (Route -> a) a
parser =
    Parser.oneOf
        [ Parser.map Home Parser.top,
          Parser.map Login (Parser.s "login"),
          Parser.map Profile <| Parser.s "profile" <?> ParserQ.string "profile_id",
          Parser.map Download <| Parser.s "download" <?> ParserQ.string "file"
        ]



-- TITLE


name : Route -> Maybe String
name route =
    case route of
        Home ->
            Just "Home"
        
        Login ->
            Just "Login"

        Profile _ ->
            Just "Profile"

        Download _ ->
            Just "Download"

        NotFound _ ->
            Just "Not found"